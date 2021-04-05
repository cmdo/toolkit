import { Token } from "cmdo-inverse";

import { Event } from "../Lib/Event";

export abstract class EventStoreService {
  /**
   * Get replica device identifier.
   *
   * @example
   *
   *   replica.identifier(); // => "john"
   *
   * @returns Replica identifier.
   */
  public abstract replica(): string;

  /**
   * Add list of events to the event store.
   *
   * @param id      - Unique primary id.
   * @param events  - List of events to add.
   * @param version - Current expected version.
   */
  public abstract save(id: string, events: Event[], version: number): Promise<void>;

  /**
   * Get list of aggregate events from the event store.
   *
   * @param aggregateId - Aggregate entity id.
   *
   * @returns Aggregate events.
   */
  public abstract getEventsForAggregate(aggregateId: string): Promise<Event[]>;

  /*
   |--------------------------------------------------------------------------------
   | Errors
   |--------------------------------------------------------------------------------
   */

  protected static AggregateNotFoundError = class extends Error {
    public readonly type = "AggregateNotFoundError" as const;

    constructor(aggregateId: string) {
      super(`Aggregate Violation: Aggregate does not exist for ${aggregateId}.`);
    }
  };

  protected static ConcurrencyError = class extends Error {
    public readonly type = "ConcurrencyError" as const;

    constructor() {
      super("Concurrency Violation: Stale data detected. Entity was already modified.");
    }
  };
}

export type EventStoreToken = Token<{ new (): EventStoreService }, EventStoreService>;
