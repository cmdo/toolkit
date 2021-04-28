import { copy } from "../Utils/Copy";
import { getTime } from "../Utils/Date";
import { Timestamp } from "./Timestamp";

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

export class HLC {
  public time: typeof getTime;
  public maxOffset: number;
  public timeUpperBound: number;
  public toleratedForwardClockJump: number;
  public last: Timestamp;

  constructor({ time, maxOffset = 0, timeUpperBound = 0, toleratedForwardClockJump = 0, last }: Options = {}) {
    this.time = time || getTime;
    this.maxOffset = maxOffset;
    this.timeUpperBound = timeUpperBound;
    this.toleratedForwardClockJump = toleratedForwardClockJump;
    this.last = new Timestamp(this.time());
    if (last) {
      this.last = Timestamp.bigger(new Timestamp(last.time), this.last);
    }
  }

  public now(): Timestamp {
    return this.update(this.last);
  }

  public update(other: Timestamp): Timestamp {
    const [time, logical] = this.getTimeAndLogicalValue(other);

    this.validateUpperBound(time, logical);
    this.last = new Timestamp(time, logical);

    return this.last;
  }

  public getTimeAndLogicalValue(other: Timestamp): [number, number] {
    const last = Timestamp.bigger(other, this.last);
    const time = this.time();
    if (this.getValidatedOffset(last, time) < 0) {
      return [time, 0];
    }
    return [last.time, last.logical + 1];
  }

  public getValidatedOffset(last: Timestamp, time: number): number {
    const offset = last.time - time;
    this.validateOffset(offset);
    return offset;
  }

  public validateOffset(offset: number) {
    this.validateForwardClockJump(offset);
    this.validateMaxOffset(offset);
  }

  public validateForwardClockJump(offset: number) {
    if (this.toleratedForwardClockJump > 0 && -offset > this.toleratedForwardClockJump) {
      throw new HLC.ForwardJumpError(-offset, this.toleratedForwardClockJump);
    }
  }

  public validateMaxOffset(offset: number) {
    if (this.maxOffset > 0 && offset > this.maxOffset) {
      throw new HLC.ClockOffsetError(offset, this.maxOffset);
    }
  }

  public validateUpperBound(time: number, logical: number) {
    const maxTime = this.timeUpperBound > 0 ? this.timeUpperBound : Number.MAX_SAFE_INTEGER;
    if (time > maxTime) {
      throw new HLC.WallTimeOverflowError(time, logical);
    }
  }

  public toJSON() {
    return copy.json({
      maxOffset: this.maxOffset,
      timeUpperBound: this.timeUpperBound,
      toleratedForwardClockJump: this.toleratedForwardClockJump,
      last: this.last.toJSON()
    });
  }

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
}
