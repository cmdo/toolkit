/* eslint-disable @typescript-eslint/no-unused-vars */

import { copy } from "../Utils/Copy";
import { getId } from "../Utils/Id";

export type EventClass<T> = {
  new (...args: any[]): T;
};

export type BaseAttributes = {
  type: string;
  localId: string;
  originId: string;
};

export type Descriptor = BaseAttributes & { data: any };

export abstract class Event<Attributes = Record<string, any>> {
  public abstract readonly type: string;

  constructor(public data: Attributes = {} as Attributes, public readonly localId = getId(), public readonly originId = localId) {}

  public encrypt(secret: string): Descriptor {
    return this.toJSON();
  }

  public decrypt(secret: string): this {
    return this;
  }

  public toJSON(data = {}): Descriptor {
    return copy.json({
      type: this.type,
      localId: this.localId,
      originId: this.originId,
      data: {
        ...this.data,
        ...data
      }
    });
  }
}
