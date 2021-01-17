import { Meta } from "../Types";

export abstract class Event<Aggregate = unknown, Data = unknown> {
  public abstract readonly type: string;

  public readonly data: Data;
  public readonly meta: Meta;

  /**
   * Create new Event instance.
   *
   * @param attributes - Event data.
   */
  constructor(data: Data, meta: Meta) {
    this.data = data;
    this.meta = {
      auditor: meta.auditor,
      created: meta.created || Math.floor(Date.now() / 1000),
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
