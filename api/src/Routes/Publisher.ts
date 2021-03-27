import { getId, merkle } from "cmdo-domain";
import { HttpSuccess, Route, router } from "cmdo-http";
import { ws } from "cmdo-socket";

import { log } from "../Logs/Stream";
import { mongo } from "../Services/Mongo";

router.register([
  new Route({
    method: "post",
    path: "/tenants/:tenant/events",
    handler: async ({ body, params }) => {
      const tenant = params.tenant;
      const description = { tenant, ...body };

      // ### Local Id
      // Add the local HLC and replica to the description.

      description.event.meta.lid = getId("api");

      // ### Insert Event
      // Insert event to the persistent event store.

      await mongo.collection("events").insertOne(description);

      // ### Merkle Root
      // Generate and store a new merkle hash value for the tenant.

      const events = await mongo.collection("events").find({ tenant }).sort({ "event.meta.oid": 1 }).toArray();
      const hash = merkle(events.map(event => event.hash));

      mongo
        .collection("hash")
        .updateOne({ tenant }, { $set: { tenant, hash } }, { upsert: true })
        .catch(error => {
          console.log(error);
        });

      log(description);

      ws.publish(`tenant-${tenant}:event`, description);

      return new HttpSuccess({ tenant, hash });
    }
  })
]);
