import { Event as BaseEvent } from "./Event";

export type AggregateClass<T> = {
  new (id: string, version: number): T;
  instance(id: string, version: number): T;
};

export abstract class AggregateRoot<Event extends BaseEvent = BaseEvent> {
  public abstract type: string;

  public changes: Event[] = []; // list of new events to publish

  /**
   * Create new AggregateRoot instance.
   *
   * @param id - Aggregate root entity id. Default: nanoid()
   */
  constructor(public readonly id: string, public readonly version = 0) {}

  /*
   |--------------------------------------------------------------------------------
   | Factories
   |--------------------------------------------------------------------------------
   */

  /**
   * Create new instance of aggregate root.
   *
   * @param id - Aggregate entity id.
   *
   * @returns AggregateRoot.
   */
  public static instance<T extends AggregateRoot>(this: AggregateClass<T>, id: string, version: number): T {
    return new this(id, version);
  }

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  /**
   * Apply event history to the aggregate.
   *
   * @param history - History of aggregate events.
   */
  public loadFromHistory(history: Event[]): this {
    for (const event of history) {
      this.apply(event, false);
    }
    return this;
  }

  /**
   * Apply new domain event to the aggregate.
   *
   * @param event - Event to apply.
   * @param isNew - Push atomic aggregate changes to local history for further processing. Default: true
   */
  protected apply(event: Event, isNew = true): void {
    this.when(event);
    if (isNew) {
      this.changes.push(event);
    }
  }

  /**
   * Fold domain event onto the aggregate.
   *
   * @param event - Event to fold.
   */
  public abstract when(event: Event): void;
}
