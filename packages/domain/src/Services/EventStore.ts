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
   * Save non committed aggregate events to persisted event store.
   *
   * @remarks
   * If expected aggregate version is less than or equal to the current persisted
   * version the save operation should fail and throw an error.
   *
   * @param aggregateId     - Aggregate entity id.
   * @param expectedVersion - Version to expect to match with the latest aggregate event.
   * @param event           - List of events to append.
   */
  public abstract save(aggregateId: string, expectedVersion: number, events: Event[]): Promise<void>;

  /**
   * Get list of aggregate events from the event store.
   *
   * @param aggregateId - Aggregate entity id.
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
