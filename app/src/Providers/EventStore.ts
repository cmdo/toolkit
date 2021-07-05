import type { EventReducer } from "cmdo-events";
import type { Event } from "shared";
import type { EventDescriptor } from "shared";
import { events } from "shared";

import { getCollection, saveDatabase } from "../Lib/Database/Utils";
import { getTenantId } from "../Lib/Tenant";
import { toArray } from "../Utils/Array";
import { orderByOriginId } from "../Utils/Sort";
import { publisher } from "./EventPublisher";
import { sync } from "./EventSync";

/*
 |--------------------------------------------------------------------------------
 | Event Store
 |--------------------------------------------------------------------------------
 */

//#region

export const store = new (class EventStore {
  /*
   |--------------------------------------------------------------------------------
   | Persistors
   |--------------------------------------------------------------------------------
   */

  //#region

  public async save(events: Event | Event[]) {
    const tenantId = getTenantId();
    for (const event of toArray(events)) {
      const descriptor = getCollection<EventDescriptor>(tenantId, "events").insertOne(getEventDescriptor(tenantId, "main", event));
      if (descriptor) {
        publisher.publish(event);
      }
    }
    saveDatabase(tenantId);
    sync.refresh(tenantId);
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Reducers
   |--------------------------------------------------------------------------------
   */

  //#region

  public async reduceById<T extends EventReducer>(
    id: string,
    reducer: T,
    initialState = reducer.initialState
  ): Promise<ReturnType<T["reduce"]>> {
    return this.reduce({ "event.data.id": id }, reducer, initialState);
  }

  public async reduce<T extends EventReducer>(
    filter: LokiQuery<any>,
    reducer: T,
    initialState = reducer.initialState
  ): Promise<ReturnType<T["reduce"]>> {
    const events = getCollection<EventDescriptor>(getTenantId(), "events").find(filter).sort(orderByOriginId).map(fromEvent);
    if (events.length === 0) {
      throw new Error("Reducer Violation: Query did not yield any events to reduce.");
    }
    return events.reduce(reducer.reduce, initialState);
  }

  //#endregion
})();

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region

function fromEvent({ event }: EventDescriptor) {
  if (!events[event.type]) {
    throw new Error(`Event Violation > Could not resolve '${event.type}' from event store.`);
  }
  return new events[event.type](event.data, event.localId, event.originId).decrypt("sample");
}

function getEventDescriptor(tenantId: string, streamId: string, event: Event): EventDescriptor {
  return {
    tenantId,
    streamId,
    deviceId: sync.deviceId,
    event: event.encrypt("sample")
  };
}

//#endregion
