/**
 * Create a copy of object that prevents mutability of original.
 *
 * @param obj - Object to copy.
 *
 * @returns Copied object.
 */
export function jsonCopy<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
