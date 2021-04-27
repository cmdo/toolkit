import type { BaseAttributes, EventReducer } from "cmdo-events";
import { Event, EventStoreService, publisher } from "cmdo-events";

import { container } from "../Container";
import { api } from "../Lib/Request";
import type { TenantStore } from "../Services/TenantStore";
import { bowser } from "../Utils/Bowser";
import { orderByOriginId } from "../Utils/Sort";

let debounce: NodeJS.Timeout;

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type EventDescriptor = BaseAttributes & Record<string, unknown>;

/*
 |--------------------------------------------------------------------------------
 | Provider
 |--------------------------------------------------------------------------------
 */

export const store = new (class EventStore extends EventStoreService {
  public origin(): string {
    return bowser.getBrowserName().toLowerCase();
  }

  public async save(events: Event | Event[], db = container.get("TenantStore")): Promise<void> {
    const collection = db.getCollection<EventDescriptor>("events");

    // ### Ensure Event

    if (!Array.isArray(events)) {
      events = [events];
    }

    // ### Event Storage
    // Insert events into the event store and publish each successful event.

    for (const event of events) {
      const descriptor = collection.insertOne(event.toJSON());
      if (descriptor) {
        publisher.publish(descriptor);
        api.post(`/tenants/toolkit/events`, { ...descriptor, $loki: undefined }).then((res) => {
          switch (res.status) {
            case "error": {
              console.log(res);
              break;
            }
          }
        });
      }
    }

    saveEventStore(db);
  }

  public async reduce<T extends EventReducer>(filter: LokiQuery<any>, reducer: T, initialState = {}, db = container.get("TenantStore")): Promise<ReturnType<T["reduce"]>> {
    const events = db.getCollection("events").find(filter).sort(orderByOriginId);
    if (events.length === 0) {
      throw new Error("Reducer Violation: Query did not yield any events to reduce.");
    }
    return events.reduce(reducer.reduce, initialState);
  }
})();

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

function saveEventStore(db: TenantStore): void {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    db.save();
  }, 500);
}
