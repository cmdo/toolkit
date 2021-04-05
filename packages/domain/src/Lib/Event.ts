import { getId } from "../Utils/Clock";
import { copy } from "../Utils/Copy";

export type EventClass<T> = {
  new (...args: any[]): T;
};

export type BaseAttributes = {
  type: string;
  localId: string;
  originId: string;
};

export abstract class Event<Attributes extends BaseAttributes = BaseAttributes> {
  public abstract readonly type: string;

  constructor(public localId = getId(), public readonly originId = localId) {}

  public toJSON(obj = {} as any): Attributes {
    return copy.json({
      type: this.type,
      localId: this.localId,
      originId: this.originId,
      ...obj
    });
  }
}
