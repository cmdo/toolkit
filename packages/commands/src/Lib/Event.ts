import { Meta } from "../Types";
import { clock, Timestamp } from "./Timestamp";

type MetaProps = {
  [key: string]: any;
  auditor: string;
  deleted?: false | "deleted" | "destroyed";
};

export abstract class Event<Aggregate = unknown, Data = unknown> {
  public abstract readonly type: string;

  public readonly data: Data;
  public readonly meta: Meta;

  /**
   * Create new Event instance.
   *
   * @param attributes - Event data.
   */
  constructor(data: Data, meta: MetaProps) {
    this.data = data;
    this.meta = {
      ...meta,
      auditor: meta.auditor,
      timestamp: Timestamp.send(clock).toString(),
      deleted: typeof meta.deleted !== "number" ? false : meta.deleted
    };
  }

  /**
   * Folds the event onto the given aggregate.
   *
   * @param aggregate - Aggregate to fold onto.
   *
   * @returns Aggregate
   */
  public abstract fold(aggregate: Aggregate): Aggregate;
}
