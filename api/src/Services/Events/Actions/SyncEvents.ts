import { getLogicalId } from "cmdo-events";
import type { Action } from "cmdo-socket";
import { EventDescriptor } from "shared";

import { mongo } from "../../../Providers/Mongo";

type Props = {
  tenantId: string;
  streamId: string;
  localId?: string;
  events: EventDescriptor[];
};

/*
 |--------------------------------------------------------------------------------
 | Action
 |--------------------------------------------------------------------------------
 */

//#region Action

export const syncEvents: Action<Props> = async function (socket, { tenantId, streamId, localId, events }) {
  const collection = mongo.collection<EventDescriptor>("events");

  const prevDescriptors = await getEventsByLocalId(tenantId, localId);
  const nextDescriptors = await getEvents(events);
  if (nextDescriptors.length > 0) {
    collection.insertMany(nextDescriptors);
    socket.to(tenantId).emit("EventAdded", { tenantId, streamId });
  }

  return this.respond({
    localId: getLocalId(nextDescriptors) ?? getLocalId(prevDescriptors),
    events: prevDescriptors
  });
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region Utilities

function getLocalId(descriptors: EventDescriptor[]): string | undefined {
  return descriptors[descriptors.length - 1]?.event.localId;
}

async function getEventsByLocalId(tenantId: string, localId?: string) {
  if (localId === undefined) {
    return mongo.collection<EventDescriptor>("events").find({ tenantId }).sort({ "event.localId": 1 }).toArray();
  }
  return mongo
    .collection<EventDescriptor>("events")
    .find({ tenantId, "event.localId": { $gt: localId } })
    .sort({ "event.localId": 1 })
    .toArray();
}

async function getEvents(events: EventDescriptor[]) {
  if (events.length <= 0) {
    return [];
  }

  const collection = mongo.collection<EventDescriptor>("events");
  const duplicates = await collection
    .find({ "event.originId": { $in: events.map((descriptor) => descriptor.event.originId) } })
    .toArray();

  if (events.length - duplicates.length <= 0) {
    return [];
  }

  const dupes = new Map();
  for (const duplicate of duplicates) {
    dupes.set(duplicate.event.originId, true);
  }
  return events
    .filter((descriptor) => !dupes.has(descriptor.event.originId))
    .map((descriptor) => {
      return getLocalDescriptor(descriptor);
    });
}

function getLocalDescriptor(descriptor: EventDescriptor): EventDescriptor {
  return {
    ...descriptor,
    event: {
      ...descriptor.event,
      localId: getLogicalId()
    }
  };
}

//#endregion
