import type { Action } from "cmdo-socket";
import { EventDescriptor } from "shared";

import { mongo } from "../../../Providers/Mongo";

type Props = {
  tenantId: string;
  deviceId: string;
};

/*
 |--------------------------------------------------------------------------------
 | Action
 |--------------------------------------------------------------------------------
 */

//#region

export const getLastKnownDeviceID: Action<Props> = async function (_, { tenantId, deviceId }) {
  return this.respond({
    originId: await getEventByDeviceId(tenantId, deviceId)
  });
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region

async function getEventByDeviceId(tenantId: string, deviceId: string) {
  const descriptors = await mongo
    .collection<EventDescriptor>("events")
    .find({ tenantId, deviceId })
    .sort({ "event.originId": 1 })
    .toArray();
  return descriptors[0]?.event.originId;
}

//#endregion
