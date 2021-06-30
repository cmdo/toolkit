import { getId } from "cmdo-events";
import type { Action } from "cmdo-http";
import { ws } from "cmdo-socket";

import { log } from "../../../Logs/Stream";
import { EventDescriptor, mongo } from "../../../Providers/Mongo";

export const addEvent: Action = async function ({ headers: { socket }, body, params: { tenant } }) {
  const collection = mongo.collection<EventDescriptor>("events");

  const prevDescriptor = (await collection.find({ tenant }).limit(1).sort({ $natural: -1 }).toArray())[0];
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

  return this.respond();
};
