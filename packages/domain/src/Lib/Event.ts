import { getId } from "../Utils/Clock";
import { jsonCopy } from "../Utils/JsonCopy";

export type EventClass<T> = {
  new (...args: any[]): T;
};

export type Meta = {
  lid: string;
  oid: string;
};

export abstract class Event {
  public abstract readonly type: string;

  public readonly meta: Meta;

  constructor() {
    const id = getId();
    this.meta = {
      lid: id,
      oid: id
    };
  }

  public toJSON(obj: any = {}): any {
    return jsonCopy({
      type: this.type,
      ...obj,
      meta: this.meta
    });
  }
}
