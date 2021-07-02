import { Event, EventClass } from "./Event";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

//#region Types

type EventHandler<T> = (event: T) => Promise<void> | void;

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Event Subscriber
 |--------------------------------------------------------------------------------
 */

//#region Event Subscriber

export class EventSubscriber<T extends Event> {
  public readonly type: string;
  public readonly handle: EventHandler<T>;

  constructor(event: EventClass<T>, handle: EventHandler<T>) {
    this.type = new event().type;
    this.handle = handle;
  }
}

//#endregion
