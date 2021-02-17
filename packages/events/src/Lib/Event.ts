import { clock, Timestamp } from "./Timestamp";
import { uuid } from "./Uuid";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type Unknown = Record<string, unknown>;

type Deleted = "soft" | "hard";

export type Meta<T> = T & {
  /**
   * UNIX timestamp of when the event was created. This value is also used for
   * sorting the event stream. Defaults to the time of creation if not manually
   * provided.
   */
  timestamp: string;

  /**
   * Delete state of the event.
   */
  deleted?: Deleted;
};

/*
 |--------------------------------------------------------------------------------
 | Event
 |--------------------------------------------------------------------------------
 */

export abstract class Event<S = Unknown, D = Unknown, M = Unknown> {
  public abstract readonly type: string;

  public readonly id: string;
  public readonly data: D;
  public readonly meta: Meta<M>;

  /**
   * Create new Event instance.
   *
   * @param attributes - Event data.
   */
  constructor(data: D, meta: M, deleted?: Deleted) {
    this.id = uuid();
    this.data = data;
    this.meta = {
      ...meta,
      timestamp: Timestamp.send(clock).toString(),
      deleted
    };
  }

  /**
   * Folds the event onto the given state.
   *
   * @param state - State to fold onto.
   *
   * @returns State
   */
  public abstract fold(state: S): S;
}
