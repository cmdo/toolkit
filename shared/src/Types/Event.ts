import type { EventJSON } from "cmdo-events";

export type EventDescriptor = {
  tenantId: string;
  streamId: string;
  deviceId: string;
  event: EventJSON;
};
