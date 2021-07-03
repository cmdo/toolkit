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
    socket.join(tenantId);
    socket.on("EventAdded", onEventAdded);
  },

  off(tenantId: string) {
    socket.leave(tenantId);
    socket.off("EventAdded", onEventAdded);
  },

  async refresh(tenantId: string) {
    const events = getQueuedEvents(tenantId);
    socket
      .post("SyncEvents", { tenantId, streamId: "main", localId: getReceivedLocalId(tenantId), events })
      .then((data) => {
        console.log(data);

        if (data.localId) {
          setReceivedLocalId(tenantId, data.localId);
        }

        let localId: string | undefined;
        if (data.events.length > 0) {
          for (const descriptor of data.events) {
            localId = addEvent(tenantId, descriptor);
          }
        }

        if (localId) {
          setSentLocalId(tenantId, localId);
        } else if (events.length > 0) {
          setSentLocalId(tenantId, events[events.length - 1].event.localId);
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

function onEventAdded({ tenantId }) {
  console.log("Event Added", tenantId);
  sync.refresh(tenantId);
}

function addEvent(tenantId: string, remote: EventDescriptor): string | undefined {
  const collection = getCollection(tenantId, "events");

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
    return local.event.localId;
  } catch (error) {
    console.log("Sync Violation: Failed to insert provided event", error);
  }
}

function getQueuedEvents(tenantId: string): EventDescriptor[] {
  return getCollection(tenantId, "events")
    .find({ "event.localId": { $gt: getSentLocalId(tenantId) ?? "" } })
    .sort(orderByLocalId)
    .map((event) => {
      delete event.$loki;
      return event;
    });
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
