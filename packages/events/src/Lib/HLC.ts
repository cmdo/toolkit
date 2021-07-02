import { copy } from "../Utils/Copy";
import { getTime } from "../Utils/Date";
import { Timestamp } from "./Timestamp";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

//#region Types

type Options = {
  time?: typeof getTime;
  maxOffset?: number;
  timeUpperBound?: number;
  toleratedForwardClockJump?: number;
  last?: {
    time: number;
    logical: number;
  };
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Hybrid Logical Clock
 |--------------------------------------------------------------------------------
 */

//#region Hybrid Logical Clock

export class HLC {
  public time: typeof getTime;

  public maxTime: number;
  public maxOffset: number;

  public timeUpperBound: number;
  public toleratedForwardClockJump: number;

  public last: Timestamp;

  constructor({ time, maxOffset = 0, timeUpperBound = 0, toleratedForwardClockJump = 0, last }: Options = {}) {
    this.time = time || getTime;
    this.maxTime = timeUpperBound > 0 ? timeUpperBound : Number.MAX_SAFE_INTEGER;
    this.maxOffset = maxOffset;
    this.timeUpperBound = timeUpperBound;
    this.toleratedForwardClockJump = toleratedForwardClockJump;
    this.last = new Timestamp(this.time());
    if (last) {
      this.last = Timestamp.bigger(new Timestamp(last.time), this.last);
    }
  }

  //#region Public Accessors

  public now(): Timestamp {
    return this.update(this.last);
  }

  public update(other: Timestamp): Timestamp {
    this.last = this.getTimestamp(other);
    return this.last;
  }

  //#endregion

  //#region Clock Utilities

  private getTimestamp(other: Timestamp): Timestamp {
    const [time, logical] = this.getTimeAndLogicalValue(other);
    if (!this.validUpperBound(time)) {
      throw new HLC.WallTimeOverflowError(time, logical);
    }
    return new Timestamp(time, logical);
  }

  private getTimeAndLogicalValue(other: Timestamp): [number, number] {
    const last = Timestamp.bigger(other, this.last);
    const time = this.time();
    if (this.validOffset(last, time)) {
      return [time, 0];
    }
    return [last.time, last.logical + 1];
  }

  //#endregion

  //#region clock validators

  private validOffset(last: Timestamp, time: number): boolean {
    const offset = last.time - time;
    if (!this.validForwardClockJump(offset)) {
      throw new HLC.ForwardJumpError(-offset, this.toleratedForwardClockJump);
    }
    if (!this.validMaxOffset(offset)) {
      throw new HLC.ClockOffsetError(offset, this.maxOffset);
    }
    if (offset < 0) {
      return true;
    }
    return false;
  }

  private validForwardClockJump(offset: number): boolean {
    if (this.toleratedForwardClockJump > 0 && -offset > this.toleratedForwardClockJump) {
      return false;
    }
    return true;
  }

  private validMaxOffset(offset: number): boolean {
    if (this.maxOffset > 0 && offset > this.maxOffset) {
      return false;
    }
    return true;
  }

  private validUpperBound(time: number): boolean {
    return time < this.maxTime;
  }

  //#endregion

  //#region clock exceptions

  public static ForwardJumpError = class extends Error {
    public readonly type = "ForwardJumpError";

    constructor(public readonly timejump: number, public readonly tolerance: number) {
      super(`Detected a forward time jump of ${timejump}ms, which exceed the allowed tolerance of ${tolerance}ms.`);
    }
  };

  public static ClockOffsetError = class extends Error {
    public readonly type = "ClockOffsetError";

    constructor(public readonly offset: number, public readonly maxOffset: number) {
      super(`The received time is ${offset}ms ahead of the wall time, exceeding the 'maxOffset' limit of ${maxOffset}ms.`);
    }
  };

  public static WallTimeOverflowError = class extends Error {
    public readonly type = "WallTimeOverflowError";

    constructor(public readonly time: number, public readonly maxTime: number) {
      super(`The wall time ${time}ms exceeds the max time of ${maxTime}ms.`);
    }
  };

  //#endregion

  public toJSON() {
    return copy.json({
      maxOffset: this.maxOffset,
      timeUpperBound: this.timeUpperBound,
      toleratedForwardClockJump: this.toleratedForwardClockJump,
      last: this.last.toJSON()
    });
  }
}

//#endregion
