import type { Descriptor } from "cmdo-events";
import { EventReducer, publisher } from "cmdo-events";
import type { Event } from "shared";
import { events } from "shared";

import { container } from "../Container";
import { api } from "../Lib/Request";
import { orderByOriginId } from "../Utils/Sort";

let debounce: NodeJS.Timeout;

export const store = new (class EventStore {
  public async save(events: Event | Event[]): Promise<void> {
    insertEvents(getEventsAsArray(events));
    saveDatabase();
  }

  public async reduceById<T extends EventReducer>(
    id: string,
    reducer: T,
    initialState = reducer.initialState
  ): Promise<ReturnType<T["reduce"]>> {
    return this.reduce({ "data.id": id }, reducer, initialState);
  }

  public async reduce<T extends EventReducer>(
    filter: LokiQuery<any>,
    reducer: T,
    initialState = reducer.initialState,
    db = container.get("Tenant")
  ): Promise<ReturnType<T["reduce"]>> {
    const events = db.getCollection<Descriptor>("events").find(filter).sort(orderByOriginId).map(fromEvent);
    if (events.length === 0) {
      throw new Error("Reducer Violation: Query did not yield any events to reduce.");
    }
    return events.reduce(reducer.reduce, initialState);
  }
})();

function fromEvent(descriptor: Descriptor) {
  if (!events[descriptor.type]) {
    throw new Error(`Event Violation > Could not resolve '${descriptor.type}' from event store.`);
  }
  return new events[descriptor.type](descriptor.data, descriptor.localId, descriptor.originId).decrypt("sample");
}

function getEventsAsArray(events: Event | Event[]): Event[] {
  if (Array.isArray(events)) {
    return events;
  }
  return [events];
}

function insertEvents(events: Event[]): void {
  for (const event of events) {
    insertAndPublishEvent(event);
  }
}

function insertAndPublishEvent(event: Event, db = container.get("Tenant")): void {
  const descriptor = db.getCollection<Descriptor>("events").insertOne(event.encrypt("sample"));
  if (descriptor) {
    publish(event);
    post(descriptor);
  }
}

function publish(event: Event): void {
  publisher.publish(event);
}

async function post(descriptor: Descriptor): Promise<any> {
  return api.post(`/tenants/toolkit/events`, { ...descriptor, $loki: undefined }).then((res) => {
    if (res.status === "error") {
      console.log(res);
    }
    return res;
  });
}

function saveDatabase(db = container.get("Tenant")): void {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    db.save();
  }, 500);
}
