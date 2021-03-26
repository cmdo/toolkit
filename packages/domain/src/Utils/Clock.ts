import HLC from "@consento/hlc";

import { container } from "../Container";

const clock = new HLC();

/**
 * Get HLC based timestamp identifier.
 *
 * @param origin - Timestamp origin.
 *
 * @returns Id.
 */
export function getId(origin: string = container.get("EventStore").replica()): string {
  const ts = clock.now().toJSON();
  return `${ts.wallTime}-${ts.logical}@${origin}`;
}

/**
 * Get HLC timestamp from a HLC id.
 *
 * @param id - Id to convert back to timestamp.
 *
 * @returns HLC.Timestamp
 */
export function getTimestamp(id: string): HLC.Timestamp {
  const [time] = id.split("@");
  const [wallTime, logical] = time.split("-");
  return new HLC.Timestamp({ wallTime, logical: Number(logical) });
}

/**
 * Get unix timestamp from HLC id.
 *
 * @param id - Id to convert to timestamp.
 *
 * @returns Unix timestamp.
 */
export function getUnixTimestamp(id: string): number {
  return Number(getTimestamp(id).wallTime) / 1000000;
}

/**
 * Get date object from a HLC id.
 *
 * @param id - Id to convert to date.
 *
 * @returns Date.
 */
export function getDate(id: string): Date {
  return new Date(getUnixTimestamp(id));
}

/**
 * Run a simple timestamp validation test.
 *
 * @param i   - Amount of timestamps to create.
 * @param min - Minimum amount of milliseconds to wait before timestamp generation.
 * @param max - Maximum amount of milliseconds to wait before timestamp generation.
 *
 * @returns Timestamps.
 */
export async function runTimestampTest(i = 10, min = 0, max = 1000) {
  let timestamps: { count: number; id: string; ts: HLC.Timestamp; dt: Date }[] = [];

  let y = 0;
  while (i--) {
    await new Promise<void>(resolve => {
      const timeout = Math.floor(Math.random() * (max - min + 1) + min);
      setTimeout(() => {
        const id = getId("app");
        const ts = getTimestamp(id);
        const dt = getDate(id);

        timestamps.push({ count: y++, id, ts, dt });

        console.log("Timestamp created after", timeout, "ms at position", y);

        resolve();
      }, timeout);
    });
  }

  timestamps = timestamps.sort((a, b) => {
    if (a.id > b.id) {
      return 1;
    }
    return -1;
  });

  let validated = true;
  let x = 0;
  for (let timestamp of timestamps) {
    if (timestamp.count !== x) {
      validated = false;
      console.log(timestamp.count, "!==", x);
      break;
    }
    x++;
  }

  return { validated, timestamps };
}
