import { Timestamp } from "../Lib/Timestamp";

export function getTimestamp(id: string): Timestamp {
  const [timestamp] = id.split("@");
  const [time, logical] = timestamp.split("-");
  return new Timestamp(time, Number(logical));
}

export function getUnixTimestamp(id: string): number {
  return getTimestamp(id).time;
}
