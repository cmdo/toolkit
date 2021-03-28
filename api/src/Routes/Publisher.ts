import { getId } from "cmdo-domain";
import { HttpError, HttpSuccess, Route, router } from "cmdo-http";
import { ws } from "cmdo-socket";

import { log } from "../Logs/Stream";
import { EventDescriptor, mongo } from "../Services/Mongo";

router.register([
  new Route({
    method: "post",
    path: "/tenants/:tenant/events",
    handler: async ({ headers: { socket }, body, params: { tenant } }) => {
      const collection = mongo.collection<EventDescriptor>("events");

      const count = await collection.count({ tenant });
      const prevDescriptor = await collection.findOne({ tenant, version: `${tenant}-${count}` });
      const nextDescriptor: EventDescriptor = {
        tenant,
        event: {
          ...body,
          localId: getId("api")
        },
        version: `${tenant}-${count + 1}`
      };

      await collection.insertOne(nextDescriptor);

      log(nextDescriptor);

      ws.publish(`${tenant}:event`, socket, tenant, prevDescriptor?.event.localId, nextDescriptor.event.localId);

      return new HttpSuccess();
    }
  }),
  new Route({
    method: "get",
    path: "/tenants/:tenant/sync",
    handler: async ({ params: { tenant }, query: { timestamp } }) => {
      const collection = mongo.collection<EventDescriptor>("events");

      if (!timestamp) {
        const events = await collection.find({ tenant }).sort({ "event.originId": 1 }).toArray();
        if (events.length === 0) {
          return new HttpError(404, "Tenant has no events.");
        }
        return new HttpSuccess({
          timestamp: events[events.length - 1].event.localId,
          events
        });
      }

      const events = await collection
        .find({ tenant, "event.localId": { $gt: timestamp } })
        .sort({ "event.originId": 1 })
        .toArray();

      return new HttpSuccess({
        timestamp: events.length > 0 ? events[events.length - 1].event.localId : timestamp,
        events
      });
    }
  })
]);
