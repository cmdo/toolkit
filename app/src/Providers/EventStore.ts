import type { BaseAttributes } from "cmdo-domain";
import { Event, EventStoreService, publisher } from "cmdo-domain";

import { container } from "../Container";
import { api } from "../Lib/Request";
import type { TenantStore } from "../Services/TenantStore";
import { bowser } from "../Utils/Bowser";
import { orderByOriginId } from "../Utils/Sort";

let debounce: NodeJS.Timeout;

export type EventDescriptor = BaseAttributes & Record<string, unknown> & { version: string };

/*
 |--------------------------------------------------------------------------------
 | Provider
 |--------------------------------------------------------------------------------
 */

export class EventStore extends EventStoreService {
  public replica(): string {
    return bowser.getBrowserName().toLowerCase();
  }

  public async save(id: string, events: Event[], expectedVersion: number, db = container.get("TenantStore")): Promise<void> {
    const collection = db.getCollection<EventDescriptor>("events");

    // ### Event Storage
    // Insert events into the event store and publish each successful event.

    for (const event of events) {
      try {
        const descriptor = collection.insertOne({ ...event.toJSON(), version: `${db.filename}-${id}-${++expectedVersion}` });
        if (descriptor) {
          publisher.publish(descriptor);
          api.post("/tenants/toolkit/events", { ...descriptor, $loki: undefined }).then((res) => {
            switch (res.status) {
              case "error": {
                console.log(res);
                break;
              }
            }
          });
        }
      } catch (error) {
        if (error.message.includes("Duplicate")) {
          throw new EventStore.ConcurrencyError();
        }
        throw error;
      }
    }

    saveEventStore(db);
  }

  public async getEventsForAggregate(aggregateId: string, db = container.get("TenantStore")): Promise<Event[]> {
    const events = db.getCollection("events").find({ aggregateId });
    if (events.length === 0) {
      throw new EventStore.AggregateNotFoundError(aggregateId);
    }
    return events.sort(orderByOriginId);
  }
}

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
