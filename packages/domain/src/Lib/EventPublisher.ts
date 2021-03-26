import EventEmitter from "eventemitter3";

import { Event, EventClass } from "./Event";

type EventHandler<T> = (event: T) => Promise<void> | void;

/*
 |--------------------------------------------------------------------------------
 | Event Publisher
 |--------------------------------------------------------------------------------
 */

export class EventPublisher extends EventEmitter {
  /**
   * Subscribe to event.
   *
   * @param subscriber - Event subscriber instance.
   */
  public subscribe<T extends Event>(subscriber: EventSubscriber<T>) {
    this.on(subscriber.type, subscriber.handle);
  }

  /**
   * Publish event to all registered listeners.
   *
   * @param event - Event to publish.
   */
  public publish(event: Event): void {
    this.emit(event.type, event);
  }

  /**
   * Reset the publisher by removing all the event listeners.
   */
  public reset(): void {
    this.removeAllListeners();
  }
}

/*
 |--------------------------------------------------------------------------------
 | Event Subscriber
 |--------------------------------------------------------------------------------
 */

export class EventSubscriber<T extends Event> {
  public readonly type: string;
  public readonly handle: EventHandler<T>;

  constructor(event: EventClass<T>, handle: EventHandler<T>) {
    this.type = new event().type;
    this.handle = handle;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Event Subscriber
 |--------------------------------------------------------------------------------
 */

export const publisher = new EventPublisher();
