import type { BaseAttributes, EventReducer } from "cmdo-events";
import { Event, publisher } from "cmdo-events";

import { container } from "../Container";
import { api } from "../Lib/Request";
import { orderByOriginId } from "../Utils/Sort";

let debounce: NodeJS.Timeout;

export type EventDescriptor = BaseAttributes & Record<string, unknown>;

export const store = new (class EventStore {
  public async save(events: Event | Event[]): Promise<void> {
    insertEvents(getEventsAsArray(events));
    saveDatabase();
  }

  public async reduce<T extends EventReducer>(
    filter: LokiQuery<any>,
    reducer: T,
    initialState = reducer.initialState,
    db = container.get("TenantStore")
  ): Promise<ReturnType<T["reduce"]>> {
    const events = db.getCollection("events").find(filter).sort(orderByOriginId);
    if (events.length === 0) {
      throw new Error("Reducer Violation: Query did not yield any events to reduce.");
    }
    return events.reduce(reducer.reduce, initialState);
  }
})();

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

function insertAndPublishEvent(event: Event, db = container.get("TenantStore")): void {
  const descriptor = db.getCollection<EventDescriptor>("events").insertOne(event.toJSON());
  if (descriptor) {
    publishEventDescriptor(descriptor);
    postEventDescriptor(descriptor);
  }
}

function publishEventDescriptor(descriptor: EventDescriptor): void {
  publisher.publish(descriptor);
}

async function postEventDescriptor(descriptor: EventDescriptor): Promise<any> {
  return api.post(`/tenants/toolkit/events`, { ...descriptor, $loki: undefined }).then((res) => {
    if (res.status === "error") {
      console.log(res);
    }
    return res;
  });
}

function saveDatabase(db = container.get("TenantStore")): void {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    db.save();
  }, 500);
}
