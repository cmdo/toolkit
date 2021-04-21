import type { EventDescriptor } from "../Providers/EventStore";

export function orderByLocalId(a: EventDescriptor, b: EventDescriptor): number {
  if (a.localId > b.localId) {
    return 1;
  }
  return -1;
}

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
