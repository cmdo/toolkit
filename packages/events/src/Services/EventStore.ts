import { Token } from "cmdo-inverse";

import { Event } from "../Lib/Event";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type EventReducer<S = unknown, E = unknown> = (state: S, event: E) => void;

/*
 |--------------------------------------------------------------------------------
 | Service
 |--------------------------------------------------------------------------------
 */

export abstract class EventStoreService {
  /**
   * Get origin identifier.
   *
   * @example
   *
   *   store.origin(); // => "web"
   *
   * @returns Event origin.
   */
  public abstract origin(): string;

  /**
   * Save list of events to the event store.
   *
   * @param events - One or many events.
   */
  public abstract save(events: Event | Event[]): Promise<void>;

  /**
   * Fetch list of events for the given filter and return a reduced state.
   *
   * @param filter  - Data filter options.
   * @param reducer - Reducer method to pipe events through.
   *
   * @returns State
   */
  public abstract reduce<S = unknown, E = unknown>(filter: unknown, reducer: EventReducer<S, E>): Promise<S>;

  /*
   |--------------------------------------------------------------------------------
   | Errors
   |--------------------------------------------------------------------------------
   */

  protected static ConcurrencyError = class extends Error {
    public readonly type = "ConcurrencyError" as const;

    constructor() {
      super("Concurrency Violation: Stale data detected. Entity was already modified.");
    }
  };
}

export type EventStoreToken = Token<{ new (): EventStoreService }, EventStoreService>;
