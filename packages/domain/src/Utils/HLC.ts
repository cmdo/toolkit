import { copy } from "./Copy";

/*
 |--------------------------------------------------------------------------------
 | Constants
 |--------------------------------------------------------------------------------
 */

const RADIX = 36;

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type TimeLike = string | number;

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

/*
 |--------------------------------------------------------------------------------
 | Timestamp
 |--------------------------------------------------------------------------------
 */

export class Timestamp {
  public readonly time: number;
  public readonly logical: number;

  constructor(time: TimeLike, logical = 0) {
    this.time = typeof time === "string" ? parseInt(time, RADIX) : time;
    this.logical = logical;
  }

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  /**
   * Compare two timestamps and return the latest of the two.
   *
   * @param a - Timestamp.
   * @param b - Timestamp.
   *
   * @returns Latest timestamp.
   */
  public static bigger(a: Timestamp, b: Timestamp): Timestamp {
    return a.compare(b) === -1 ? b : a;
  }

  /**
   * Convert time to a string.
   *
   * @returns Time as string.
   */
  public encode(): string {
    return this.time.toString(RADIX);
  }

  /**
   * Compare timestamp with another timestamp.
   *
   * @param other - Timestamp.
   *
   * @returns Sorting number.
   */
  public compare(other: Timestamp): 1 | 0 | -1 {
    if (this.time > other.time) {
      return 1;
    }
    if (this.time < other.time) {
      return -1;
    }
    if (this.logical > other.logical) {
      return 1;
    }
    if (this.logical < other.logical) {
      return -1;
    }
    return 0;
  }

  /*
   |--------------------------------------------------------------------------------
   | Serializer
   |--------------------------------------------------------------------------------
   */

  public toJSON() {
    return copy.json({
      time: this.encode(),
      logical: this.logical
    });
  }
}

/*
 |--------------------------------------------------------------------------------
 | Hybrid Logical Clock
 |--------------------------------------------------------------------------------
 */

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

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  /**
   * Retrieve a timestamp representing now.
   *
   * @returns Timestamp.
   */
  public now(): Timestamp {
    return this.update(this.last);
  }

  /**
   * Update clock and return new last timestamp.
   *
   * @param other - Timestamp to compare with.
   *
   * @returns Timestamp.
   */
  public update(other: Timestamp): Timestamp {
    const last = Timestamp.bigger(other, this.last);

    // ### Time
    // Generate a now time.

    let time = this.time();

    // ### Offset

    const offset = last.time - time;
    this.validateOffset(offset);

    // ### Assign Values

    let logical: number;
    if (offset < 0) {
      logical = 0;
    } else {
      time = last.time;
      logical = last.logical + 1;
    }

    // ### Validate Upper Bound

    const maxTime = this.timeUpperBound > 0 ? this.timeUpperBound : Number.MAX_SAFE_INTEGER;
    if (time > maxTime) {
      throw new HLC.WallTimeOverflowError(time, logical);
    }

    // ### Update Last

    this.last = new Timestamp(time, logical);

    return this.last;
  }

  /**
   * Validate offset resulting from comparing two timestamps.
   *
   * @param offset - Comparison offset.
   */
  public validateOffset(offset: number) {
    if (this.toleratedForwardClockJump > 0 && -offset > this.toleratedForwardClockJump) {
      throw new HLC.ForwardJumpError(-offset, this.toleratedForwardClockJump);
    }
    if (this.maxOffset > 0 && offset > this.maxOffset) {
      throw new HLC.ClockOffsetError(offset, this.maxOffset);
    }
  }

  /*
   |--------------------------------------------------------------------------------
   | Serializer
   |--------------------------------------------------------------------------------
   */

  public toJSON() {
    return copy.json({
      maxOffset: this.maxOffset,
      timeUpperBound: this.timeUpperBound,
      toleratedForwardClockJump: this.toleratedForwardClockJump,
      last: this.last.toJSON()
    });
  }

  /*
   |--------------------------------------------------------------------------------
   | Errors
   |--------------------------------------------------------------------------------
   */

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

function getTime(): number {
  return Date.now();
}
