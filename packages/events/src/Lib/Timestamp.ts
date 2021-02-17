import murmurhash from "murmurhash";

import { uuid } from "./Uuid";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type Config = {
  maxDrift: number;
};

type State = {
  millis: number;
  counter: number;
  node: string;
};

/*
 |--------------------------------------------------------------------------------
 | Config
 |--------------------------------------------------------------------------------
 */

const config: Config = {
  maxDrift: 60000 // Maximum physical clock drift allowed, in ms
};

/*
 |--------------------------------------------------------------------------------
 | Timestamp
 |--------------------------------------------------------------------------------
 */

export class Timestamp {
  protected state: State;

  constructor(millis: number, counter: number, node: string) {
    this.state = { millis, counter, node };
  }

  public static init(options: Partial<Config> = {}): void {
    if (options.maxDrift) {
      config.maxDrift = options.maxDrift;
    }
  }

  /**
   * Timestamp send. Generates a unique, monotonic timestamp suitable
   * for transmission to another system in string format.
   */
  public static send(clock: MutableTimestamp): Timestamp {
    // Retrieve the local wall time

    const phys = Date.now();

    // Unpack the clock.timestamp logical time and counter

    const lOld = clock.millis();
    const cOld = clock.counter();

    // Calculate the next logical time and counter
    // * ensure that the logical time never goes backward
    // * increment the counter if phys time does not advance

    const lNew = Math.max(lOld, phys);
    const cNew = lOld === lNew ? cOld + 1 : 0;

    // Check the result for drift and counter overflow

    if (lNew - phys > config.maxDrift) {
      throw new Timestamp.ClockDriftError(lNew, phys, config.maxDrift);
    }

    if (cNew > 65535) {
      throw new Timestamp.OverflowError();
    }

    // Repack the logical time/counter

    clock.setMillis(lNew);
    clock.setCounter(cNew);

    return new Timestamp(clock.millis(), clock.counter(), clock.node());
  }

  public static recv(clock: MutableTimestamp, msg: Timestamp): Timestamp {
    const phys = Date.now();

    // Unpack the message wall time/counter

    const lMsg = msg.millis();
    const cMsg = msg.counter();

    // Assert the node id and remote clock drift

    if (msg.node() === clock.node()) {
      throw new Timestamp.DuplicateNodeError(clock.node());
    }

    if (lMsg - phys > config.maxDrift) {
      throw new Timestamp.ClockDriftError();
    }

    // Unpack the clock.timestamp logical time and counter

    const lOld = clock.millis();
    const cOld = clock.counter();

    // Calculate the next logical time and counter.
    // Ensure that the logical time never goes backward;
    // * if all logical clocks are equal, increment the max counter,
    // * if max = old > message, increment local counter,
    // * if max = message > old, increment message counter,
    // * otherwise, clocks are monotonic, reset counter

    const lNew = Math.max(Math.max(lOld, phys), lMsg);
    const cNew = lNew === lOld && lNew === lMsg ? Math.max(cOld, cMsg) + 1 : lNew === lOld ? cOld + 1 : lNew === lMsg ? cMsg + 1 : 0;

    // Check the result for drift and counter overflow

    if (lNew - phys > config.maxDrift) {
      throw new Timestamp.ClockDriftError();
    }

    if (cNew > 65535) {
      throw new Timestamp.OverflowError();
    }

    // Repack the logical time/counter

    clock.setMillis(lNew);
    clock.setCounter(cNew);

    return new Timestamp(clock.millis(), clock.counter(), clock.node());
  }

  public static parse(timestamp: string): Timestamp {
    const parts = timestamp.split("-");
    if (parts && parts.length === 5) {
      const millis = Date.parse(parts.slice(0, 3).join("-")).valueOf();
      const counter = parseInt(parts[3], 16);
      const node = parts[4];
      if (!isNaN(millis) && !isNaN(counter)) {
        return new Timestamp(millis, counter, node);
      }
    }
    throw new Timestamp.ParseError(timestamp);
  }

  public static since(isoString: string): string {
    return isoString + "-0000-0000000000000000";
  }

  public millis(): number {
    return this.state.millis;
  }

  public counter(): number {
    return this.state.counter;
  }

  public node(): string {
    return this.state.node;
  }

  public hash(): number {
    return murmurhash.v3(this.toString());
  }

  public valueOf(): string {
    return this.toString();
  }

  public toString(): string {
    return [
      new Date(this.millis()).toISOString(),
      ("0000" + this.counter().toString(16).toUpperCase()).slice(-4),
      ("0000000000000000" + this.node()).slice(-16)
    ].join("-");
  }

  private static DuplicateNodeError = class extends Error {
    public type = "DuplicateNodeError" as const;

    constructor(node: any) {
      super();
      this.message = "Duplicate node identifier " + node;
    }
  };

  private static ClockDriftError = class extends Error {
    public type = "ClockDriftError" as const;

    constructor(...args: any[]) {
      super();
      this.message = ["Maximum clock drift exceeded"].concat(args).join(" ");
    }
  };

  private static OverflowError = class extends Error {
    public type = "OverflowError" as const;

    constructor() {
      super();
      this.message = "Timestamp counter overflow";
    }
  };

  private static ParseError = class extends Error {
    public type = "ParseError" as const;

    public value: any;

    constructor(value: any) {
      super();
      this.message = "Failed to parse timestamp string";
      this.value = value;
    }
  };
}

/*
 |--------------------------------------------------------------------------------
 | Mutable Timestamp
 |--------------------------------------------------------------------------------
 */

class MutableTimestamp extends Timestamp {
  public static from(timestamp: Timestamp): MutableTimestamp {
    return new MutableTimestamp(timestamp.millis(), timestamp.counter(), timestamp.node());
  }

  public setMillis(n: number) {
    this.state.millis = n;
  }

  public setCounter(n: number) {
    this.state.counter = n;
  }

  public setNode(n: string) {
    this.state.node = n;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

export function makeClientId(): string {
  return uuid().replace(/-/g, "").slice(-16);
}

/*
 |--------------------------------------------------------------------------------
 | Clock
 |--------------------------------------------------------------------------------
 */

export const clock = MutableTimestamp.from(new Timestamp(0, 0, makeClientId()));
