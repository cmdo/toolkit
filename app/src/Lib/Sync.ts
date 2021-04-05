import { getId, publisher } from "cmdo-domain";

import { container } from "../Container";
import type { EventDescriptor } from "../Providers/EventStore";
import { orderByLocalId } from "../Utils/Sort";
import { api } from "./Request";
import { socket } from "./Socket";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type RemoteEventDescriptor = {
  tenant: string;
  event: EventDescriptor;
  version: string;
};

/*
 |--------------------------------------------------------------------------------
 | Synchronization
 |--------------------------------------------------------------------------------
 */

export const sync = {
  /**
   * Start listening for event changes for the given tenant.
   *
   * @param tenantId - Tenant id to listen for changes too.
   */
  on(tenantId: string): void {
    socket.on(`${tenantId}:event`, handleEvent);
  },

  /**
   * Stop listening for event changes for the given tenant.
   *
   * @param tenantId - Tenant id to stop listening too.
   */
  off(tenantId: string): void {
    socket.off(`${tenantId}:event`, handleEvent);
  },

  /**
   * Perform both get and send commands to the given tenant.
   *
   * @param tenantId - Tenant to refresh.
   */
  async refresh(tenantId: string, db = container.get("TenantStore")): Promise<void> {
    const events = db
      .getCollection("events")
      .find({ localId: { $gt: localStorage.getItem(`${tenantId}.sent`) || "" } })
      .sort(orderByLocalId)
      .map((event) => {
        delete event.$loki;
        return event;
      });

    // ### Send Sync Request

    const res = await api.post(`/tenants/${tenantId}/sync`, {
      timestamp: localStorage.getItem(`${tenantId}.received`) || undefined,
      events
    });

    // ### Handle Response

    switch (res.status) {
      case "success": {
        localStorage.setItem(`${tenantId}.received`, res.data.timestamp);

        let localId: string | undefined;
        if (res.data.events.length > 0) {
          for (const descriptor of res.data.events) {
            localId = addRemoteEvent(descriptor);
          }
        }

        if (localId) {
          localStorage.setItem(`${tenantId}.sent`, localId || events[events.length - 1].localId);
        } else if (events.length > 0) {
          localStorage.setItem(`${tenantId}.sent`, events[events.length - 1].localId);
        }

        break;
      }
      case "error": {
        console.log(res);
        break;
      }
    }
  }
};

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

/**
 * Handle incoming event notification.
 *
 * @remarks
 *
 * If the originSocketId matches the current clients socket id, and the previous
 * local id is the one we have cached locally. We skip the syncing process since
 * we now know that the next local id came right after the last known local id.
 *
 * If the above use case is not valid then we check if the current local id is
 * younger than the next local id. If they do not match we are out of sync and
 * send another sync request to get back to parity.
 *
 * @param originSocketId - Socket id of the client that logged the event.
 * @param tenantId       - Tenant id in which the event was logged under.
 * @param prevLocalId    - Local id of the last known event before the next event.
 * @param nextLocalId    - Local id of the logged event.
 */
function handleEvent(originSocketId: string | undefined, tenantId: string, prevLocalId: string | undefined, nextLocalId: string) {
  const currentLocalId = localStorage.getItem(`${tenantId}.received`) || undefined;
  if (originSocketId === socket?.id && currentLocalId === prevLocalId) {
    localStorage.setItem(`${tenantId}.received`, nextLocalId);
  } else if (!currentLocalId || currentLocalId < nextLocalId) {
    sync.refresh(tenantId);
  }
}

/**
 * Add event from remote replica.
 *
 * @param remote - Remote event descriptor.
 */
function addRemoteEvent(remote: RemoteEventDescriptor, db = container.get("TenantStore")): string | undefined {
  const collection = db.getCollection<EventDescriptor>("events");

  const count = collection.count({ originId: remote.event.originId });
  if (count > 0) {
    console.log("Already have event, skipping ..."); // we already have the event ...
    return;
  }

  try {
    const localId = getId();
    const event = collection.insertOne({ ...remote.event, localId });
    if (event) {
      publisher.publish(event);
    }
    return localId;
  } catch (error) {
    console.log("Fail to hydrate incoming event", error);
  }
}
