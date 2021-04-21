import { getId } from "cmdo-events";
import { HttpError, HttpSuccess, Route, router } from "cmdo-http";
import { ws } from "cmdo-socket";

import { log } from "../Logs/Stream";
import { EventDescriptor, mongo } from "../Services/Mongo";

/*
 |--------------------------------------------------------------------------------
 | Routes
 |--------------------------------------------------------------------------------
 */

router.register([
  new Route({
    method: "post",
    path: "/streams/:stream/events",
    handler: async ({ headers: { socket }, body, params: { stream } }) => {
      const collection = mongo.collection<EventDescriptor>("events");

      const prevDescriptor = await collection.findOne({ stream });
      const nextDescriptor: EventDescriptor = {
        stream,
        event: {
          ...body,
          localId: getId("api")
        }
      };

      await collection.insertOne(nextDescriptor);

      log(nextDescriptor);

      ws.publish(`${stream}:event`, socket, stream, prevDescriptor?.event.localId, nextDescriptor.event.localId);

      return new HttpSuccess();
    }
  }),
  new Route({
    method: "post",
    path: "/streams/:stream/sync",
    handler: async ({ params: { stream }, body: { events, timestamp } }) => {
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
              stream,
              event
            });
          }

          await collection.insertMany(descriptors);
        }
      }

      // ### Outgoing Events

      events = await collection.find({ stream }).sort({ "event.localId": 1 }).toArray();

      if (!timestamp) {
        if (events.length === 0) {
          return new HttpError(200, "Tenant has no events.");
        }
        return new HttpSuccess({
          timestamp: events[events.length - 1].event.localId,
          events
        });
      }

      return new HttpSuccess({
        timestamp: events.length > 0 ? events[events.length - 1].event.localId : timestamp,
        events: await collection
          .find({ stream, "event.localId": { $gt: timestamp } })
          .sort({ "event.localId": 1 })
          .toArray()
      });
    }
  })
]);
