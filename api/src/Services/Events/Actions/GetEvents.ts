import type { Action } from "cmdo-socket";
import { EventDescriptor } from "shared";

import { mongo } from "../../../Providers/Mongo";

/*
 |--------------------------------------------------------------------------------
 | Action
 |--------------------------------------------------------------------------------
 */

//#region Action

export const getEvents: Action<{ tenantId: string; localId: string }> = async function (_, { tenantId, localId }) {
  return this.respond({
    events: await getEventsByLocalId(tenantId, localId)
  });
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region Utilities

export async function getEventsByLocalId(tenantId: string, localId: string) {
  if (localId === undefined) {
    return mongo.collection<EventDescriptor>("events").find({ tenantId }).sort({ "event.localId": 1 }).toArray();
  }
  return mongo
    .collection<EventDescriptor>("events")
    .find({ tenantId, "event.localId": { $gt: localId } })
    .sort({ "event.localId": 1 })
    .toArray();
}

//#endregion
