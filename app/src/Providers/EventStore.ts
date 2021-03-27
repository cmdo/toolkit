import { Event, EventDescriptor, EventStoreService, publisher } from "cmdo-domain";

import { container } from "../Container";
import { api } from "../Lib/Request";
import type { TenantStore } from "../Services/TenantStore";
import { orderByOriginId } from "../Utils/Sort";

let debounce: NodeJS.Timeout;

/*
 |--------------------------------------------------------------------------------
 | Provider
 |--------------------------------------------------------------------------------
 */

export class EventStore extends EventStoreService {
  public replica(): string {
    return "app";
  }

  public async save(aggregateId: string, expectedVersion: number, events: Event[], db = container.get("TenantStore")): Promise<void> {
    const collection = db.getCollection("events");

    // ### Event Storage
    // Insert events into the event store and publish each successful event.

    let i = expectedVersion + 1;
    for (const event of events) {
      try {
        const message = collection.insertOne(new EventDescriptor(aggregateId, event, i).toJSON());
        if (message) {
          publisher.publish(message.event);
          const res = api.post("/tenants/sample/events", { ...message, $loki: undefined });
          console.log(res);
        }
      } catch (error) {
        if (error.message.includes("Duplicate")) {
          throw new EventStore.ConcurrencyError();
        }
        throw error;
      }
      i++;
    }

    saveEventStore(db);
  }

  public async getEventsForAggregate(aggregateId: string, db = container.get("TenantStore")): Promise<Event[]> {
    const messages = db.getCollection<EventDescriptor>("events").find({ id: aggregateId });
    if (messages.length === 0) {
      throw new EventStore.AggregateNotFoundError(aggregateId);
    }
    return messages.sort(orderByOriginId).map((message) => Object.freeze(message.event));
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
