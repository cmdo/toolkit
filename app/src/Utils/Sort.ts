import type { EventDescriptor } from "../Providers/EventStore";

export function orderByOriginId(a: EventDescriptor, b: EventDescriptor): number {
  if (a.originId > b.originId) {
    return 1;
  }
  return -1;
}

export function orderByReversedOriginId(a: EventDescriptor, b: EventDescriptor): number {
  if (a.originId < b.originId) {
    return 1;
  }
  return -1;
}
