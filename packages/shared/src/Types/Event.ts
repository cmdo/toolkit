import type { EventJSON } from "cmdo-events";

export type EventDescriptor = {
  tenantId: string;
  streamId: string;
  event: EventJSON;
};
