/* eslint-disable @typescript-eslint/no-unused-vars */

import { copy } from "../Utils/Copy";
import { getLogicalId } from "../Utils/Id";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

//#region Types

export type EventClass<T> = {
  new (...args: any[]): T;
};

export type EventJSON = {
  type: string;
  localId: string;
  originId: string;
  data: Record<string, any>;
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Event
 |--------------------------------------------------------------------------------
 */

//#region Event

export abstract class Event<Attributes = Record<string, any>> {
  public abstract readonly type: string;

  constructor(
    public data: Attributes = {} as Attributes,
    public readonly localId = getLogicalId(),
    public readonly originId = localId
  ) {}

  public encrypt(_: string): EventJSON {
    return this.toJSON();
  }

  public decrypt(_: string): this {
    return this;
  }

  public toJSON(data = {}): EventJSON {
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

//#endregion
