import { getId } from "cmdo-events";
import type { EventDescriptor } from "shared";
import { events } from "shared";

import { publisher } from "../Providers/EventPublisher";
import { orderByLocalId } from "../Utils/Sort";
import { getCollection } from "./Database/Utils";
import { socket } from "./Socket";

/*
 |--------------------------------------------------------------------------------
 | Synchronization
 |--------------------------------------------------------------------------------
 */

//#region Synchronization

export const sync = {
  on(tenantId: string) {
    socket.on(`${tenantId}:event`, onEventAdded);
  },

  off(tenantId: string) {
    socket.off(`${tenantId}:event`, onEventAdded);
  },

  async refresh(tenantId: string) {
    // ...
  },

  async postTenantEvents(tenantId: string) {
    const localEvents = getCollection<EventDescriptor>(tenantId, "events")
      .find({ "event.localId": { $gt: getSentLocalId(tenantId) ?? "" } })
      .sort(orderByLocalId)
      .map((event) => {
        delete event.$loki;
        return event;
      });

    if (localEvents.length > 0) {
      socket
        .post("AddEvents", { tenantId, streamId: "main", localId: getReceivedLocalId(tenantId), events: localEvents })
        .then(({ events, localId }) => {
          for (const descriptor of events) {
            addEvent(tenantId, descriptor);
          }
          setReceivedLocalId(tenantId, localId);
          setSentLocalId(tenantId, localEvents[localEvents.length - 1].event.localId);
        });
    }
  },

  async getTenantEvents(tenantId: string) {
    socket
      .post("GetEvents", { tenantId, localId: getReceivedLocalId(tenantId) })
      .then(({ events }) => {
        console.log(events);
        for (const descriptor of events) {
          addEvent(tenantId, descriptor);
        }
        if (events.length > 0) {
          setReceivedLocalId(tenantId, events[events.length - 1].event.localId);
        }
      })
      .catch(console.log);
  }
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region Utilities

function onEventAdded({ tenantId, prevLocalId, nextLocalId }) {
  const currentLocalId = getReceivedLocalId(tenantId);
  if (currentLocalId === prevLocalId) {
    localStorage.setItem(`${tenantId}.received`, nextLocalId);
  } else if (!currentLocalId || currentLocalId < nextLocalId) {
    sync.getTenantEvents(tenantId);
  }
}

function addEvent(tenantId: string, remote: EventDescriptor): string | undefined {
  const collection = getCollection<EventDescriptor>(tenantId, "events");

  const count = collection.count({ "event.originId": remote.event.originId });
  if (count > 0) {
    console.log("Sync Violation: Event already exists, skipping insertion.");
    return;
  }

  try {
    const local = collection.insertOne({
      ...remote,
      event: {
        ...remote.event,
        localId: getId()
      }
    });
    if (local) {
      publisher.publish(new events[local.event.type](local.event.data, local.event.localId, local.event.originId).decrypt("sample"));
    }
    return local.event.originId;
  } catch (error) {
    console.log("Sync Violation: Failed to insert provided event", error);
  }
}

function setSentLocalId(tenantId: string, localId: string) {
  localStorage.setItem(`${tenantId}.sent`, localId);
}

function setReceivedLocalId(tenantId: string, localId: string) {
  localStorage.setItem(`${tenantId}.received`, localId);
}

function getSentLocalId(tenantId: string): string | undefined {
  return localStorage.getItem(`${tenantId}.sent`) ?? undefined;
}

function getReceivedLocalId(tenantId: string): string | undefined {
  return localStorage.getItem(`${tenantId}.received`) ?? undefined;
}

//#endregion
