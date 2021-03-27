import type { EventDescriptor } from "cmdo-domain";

export function orderByOriginId(a: EventDescriptor, b: EventDescriptor): number {
  if (a.event.meta.oid > b.event.meta.oid) {
    return 1;
  }
  return -1;
}
