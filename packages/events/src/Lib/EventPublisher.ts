import EventEmitter from "eventemitter3";

import type { Event } from "./Event";
import type { EventSubscriber } from "./EventSubscriber";

/*
 |--------------------------------------------------------------------------------
 | Event Publisher
 |--------------------------------------------------------------------------------
 */

//#region Event Publisher

export class EventPublisher extends EventEmitter {
  public subscribe<T extends Event>(subscriber: EventSubscriber<T>) {
    this.on(subscriber.type, subscriber.handle);
  }

  public publish<T extends Event>(event: T): void {
    this.emit(event.type, event);
    this.emit("publish", event);
  }

  public reset(): void {
    this.removeAllListeners();
  }
}

//#endregion
