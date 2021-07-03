import { getId } from "cmdo-events";
import type { Action } from "cmdo-socket";
import { EventDescriptor } from "shared";

import { log } from "../../../Logs/Stream";
import { mongo } from "../../../Providers/Mongo";
import { getEventsByLocalId } from "./GetEvents";

/*
 |--------------------------------------------------------------------------------
 | Action
 |--------------------------------------------------------------------------------
 */

//#region Action

export const addEvents: Action<{ tenantId: string; streamId: string; localId?: string; events: EventDescriptor[] }> = async function (
  socket,
  { tenantId, streamId, localId, events }
) {
  if (events.length <= 0) {
    return this.reject("Events Violation: No events provided!");
  }

  const collection = mongo.collection<EventDescriptor>("events");
  const prevEvents = localId ? await getEventsByLocalId(tenantId, localId) : [];

  let nextLocalId!: string;

  const nextDescriptors: EventDescriptor[] = [];
  for (const event of events) {
    const descriptor = getNextDescriptor(event);
    nextLocalId = descriptor.event.localId;
    nextDescriptors.push(descriptor);
  }

  await collection.insertMany(nextDescriptors);

  nextDescriptors.forEach(log);

  socket.to(tenantId).emit("EventAdded", { tenantId, streamId });

  return this.respond({ events: prevEvents, localId: nextLocalId });
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region Utilities

function getNextDescriptor(descriptor: EventDescriptor): EventDescriptor {
  return {
    ...descriptor,
    event: {
      ...descriptor.event,
      localId: getId("api")
    }
  };
}

//#endregion
