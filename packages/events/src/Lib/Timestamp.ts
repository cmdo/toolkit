import { copy } from "../Utils/Copy";

/*
 |--------------------------------------------------------------------------------
 | Constants
 |--------------------------------------------------------------------------------
 */

//#region

const RADIX = 36;

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

//#region

type TimeLike = string | number;

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Timestamp
 |--------------------------------------------------------------------------------
 */

//#region

export class Timestamp {
  public readonly time: number;
  public readonly logical: number;

  constructor(time: TimeLike, logical = 0) {
    this.time = typeof time === "string" ? parseInt(time, RADIX) : time;
    this.logical = logical;
  }

  public static bigger(a: Timestamp, b: Timestamp): Timestamp {
    return a.compare(b) === -1 ? b : a;
  }

  public encode(): string {
    return this.time.toString(RADIX);
  }

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

  public toJSON() {
    return copy.json({
      time: this.encode(),
      logical: this.logical
    });
  }
}

//#endregion
