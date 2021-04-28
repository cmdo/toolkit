import { Event, EventClass } from "./Event";

type EventHandler<T> = (event: T) => Promise<void> | void;

export class EventSubscriber<T extends Event> {
  public readonly type: string;
  public readonly handle: EventHandler<T>;

  constructor(event: EventClass<T>, handle: EventHandler<T>) {
    this.type = new event().type;
    this.handle = handle;
  }
}
