import { clock, Timestamp } from "./Timestamp";
import { uuid } from "./Uuid";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type Unknown = Record<string, unknown>;

type Props<Data, Meta> = {
  id?: string;
  data: Data;
  meta: Meta & {
    timestamp?: string;
    deleted?: Deleted;
  };
};

export type Meta<T> = T & {
  timestamp: string;
  deleted?: Deleted;
};

type Deleted = "soft" | "hard";

/*
 |--------------------------------------------------------------------------------
 | Event
 |--------------------------------------------------------------------------------
 */

export abstract class Event<State = Unknown, Data = Unknown, MetaData = Unknown> {
  public abstract readonly type: string;

  public readonly id: string;
  public readonly data: Data;
  public readonly meta: Meta<MetaData>;

  /**
   * Create new Event instance.
   *
   * @param props - Event properties.
   */
  constructor({ id = uuid(), data, meta }: Props<Data, MetaData>) {
    this.id = id;
    this.data = data;
    this.meta = {
      ...meta,
      timestamp: meta.timestamp || Timestamp.send(clock).toString()
    };
  }

  /**
   * Folds the event onto the given state.
   *
   * @param state - State to fold onto.
   *
   * @returns State
   */
  public abstract fold(state: State): State;
}
