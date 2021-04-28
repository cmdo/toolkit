import EventEmitter from "eventemitter3";

import type { Event } from "./Event";
import type { EventSubscriber } from "./EventSubscriber";

type EventDescriptor = Pick<Event, "type" | "localId" | "originId"> & Record<string, unknown>;

export class EventPublisher extends EventEmitter {
  public subscribe<T extends Event>(subscriber: EventSubscriber<T>) {
    this.on(subscriber.type, subscriber.handle);
  }

  public publish(event: EventDescriptor): void {
    this.emit(event.type, event);
    this.emit("publish", event);
  }

  public reset(): void {
    this.removeAllListeners();
  }
}

export const publisher = new EventPublisher();
