import { getId } from "cmdo-events";
import type { Action } from "cmdo-http";

import { EventDescriptor, mongo } from "../../../Providers/Mongo";

export const syncEvents: Action = async function ({ params: { tenant }, body: { events, timestamp } }) {
  const collection = mongo.collection<EventDescriptor>("events");

  // ### Incoming Events

  if (events.length > 0) {
    const duplicates = await collection.find({ "event.originId": { $in: events.map((event: any) => event.originId) } }).toArray();
    if (events.length - duplicates.length > 0) {
      const dupes = new Map();
      for (const duplicate of duplicates) {
        dupes.set(duplicate.event.originId, true);
      }
      const descriptors = [];
      for (const event of events.filter((event: any) => !dupes.has(event.originId))) {
        event.localId = getId("api");
        descriptors.push({
          tenant,
          event
        });
      }

      await collection.insertMany(descriptors);
    }
  }

  // ### Outgoing Events

  events = await collection.find({ tenant }).sort({ "event.localId": 1 }).toArray();

  if (!timestamp) {
    if (events.length === 0) {
      return this.reject(200, "Stream has no events.");
    }
    return this.respond({
      timestamp: events[events.length - 1].event.localId,
      events
    });
  }

  return this.respond({
    timestamp: events.length > 0 ? events[events.length - 1].event.localId : timestamp,
    events: await collection
      .find({ tenant, "event.localId": { $gt: timestamp } })
      .sort({ "event.localId": 1 })
      .toArray()
  });
};
