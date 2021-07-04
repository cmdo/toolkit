import { Timestamp } from "../Lib/Timestamp";

/**
 * Get timestamp instance from provided logical id.
 *
 * @param id - An events localId or originId.
 *
 * @returns Timestamp
 */
export function getTimestamp(id: string): Timestamp {
  const [time, logical] = id.split("-");
  return new Timestamp(time, Number(logical));
}

/**
 * Get unix timestamp value from provided logical id.
 *
 * @param id - An events localId or originId.
 *
 * @returns Unix timestamp
 */
export function getUnixTimestamp(id: string): number {
  return getTimestamp(id).time;
}
