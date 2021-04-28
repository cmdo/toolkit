import { getUnixTimestamp } from "./Timestamp";

export function getDate(id: string): Date {
  return new Date(getUnixTimestamp(id));
}

export function getTime(): number {
  return Date.now();
}
