export function toHashQuery(value: string): string {
  return value.toLowerCase().replace(" ", "-").trim();
}
