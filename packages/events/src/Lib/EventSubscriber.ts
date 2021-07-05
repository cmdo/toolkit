import { Event, EventClass } from "./Event";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

//#region

type EventHandler<T> = (event: T) => Promise<void> | void;

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Event Subscriber
 |--------------------------------------------------------------------------------
 */

//#region

export class EventSubscriber<T extends Event> {
  public readonly type: string;
  public readonly handle: EventHandler<T>;

  constructor(event: EventClass<T>, handle: EventHandler<T>) {
    this.type = new event({}, "setup").type;
    this.handle = handle;
  }
}

//#endregion
