import type { Event } from "./Event";
import type { EventSubscriber } from "./EventSubscriber";

/*
 |--------------------------------------------------------------------------------
 | Event Publisher
 |--------------------------------------------------------------------------------
 */

//#region

export class EventPublisher {
  public readonly handlers = new Map<string, EventSubscriber<any>["handle"]>();
  public readonly messages: Event[] = [];

  public isProcessing = false;

  /*
   |--------------------------------------------------------------------------------
   | Setup
   |--------------------------------------------------------------------------------
   */

  //#region

  public subscribe(subscribers: EventSubscriber[]) {
    for (const subscriber of subscribers) {
      this.handlers.set(subscriber.type, subscriber.handle);
    }
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  //#region

  public publish<T extends Event>(event: T): void {
    this.messages.push(event);
    this.process();
  }

  public reset(): void {
    this.handlers.clear();
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Message Processor
   |--------------------------------------------------------------------------------
   */

  //#region

  private async process() {
    if (this.isProcessing) {
      return; // already processing event
    }

    this.isProcessing = true;

    const event = this.messages.shift();
    if (!event) {
      this.isProcessing = false;
      return; // no more events to process
    }

    const handler = this.handlers.get(event.type);
    if (!handler) {
      throw new EventPublisher.HandlerNotFoundError(event.type);
    }

    handler(event).finally(() => {
      this.isProcessing = false;
      this.process();
    });
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Errors
   |--------------------------------------------------------------------------------
   */

  //#region

  public static HandlerNotFoundError = class extends Error {
    public readonly type = "HandlerNotFoundError";

    constructor(type: string) {
      super(
        `Event Publisher Violation: Failed to provide '${type}' handler, make sure to register all handlers with the event publisher.`
      );
    }
  };

  //#endregion
}

//#endregion
