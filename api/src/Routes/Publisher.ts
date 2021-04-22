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
    path: "/tenants/:tenant/events",
    handler: async ({ headers: { socket }, body, params: { tenant } }) => {
      const collection = mongo.collection<EventDescriptor>("events");

      const prevDescriptor = await collection.findOne({ tenant });
      const nextDescriptor: EventDescriptor = {
        tenant,
        event: {
          ...body,
          localId: getId("api")
        }
      };

      await collection.insertOne(nextDescriptor);

      log(nextDescriptor);

      ws.publish(`${tenant}:event`, socket, tenant, prevDescriptor?.event.localId, nextDescriptor.event.localId);

      return new HttpSuccess();
    }
  }),
  new Route({
    method: "post",
    path: "/tenants/:tenant/sync",
    handler: async ({ params: { tenant }, body: { events, timestamp } }) => {
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
          .find({ tenant, "event.localId": { $gt: timestamp } })
          .sort({ "event.localId": 1 })
          .toArray()
      });
    }
  })
]);
