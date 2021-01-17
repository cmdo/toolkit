import { HttpError } from "cmdo-http";

/**
 * Checks for missing keys that are required to exist on the data, if the check
 * fails an error is thrown.
 *
 * @param data - Data to check.
 * @param keys - Keys that are required to exist.
 */
export function verifyData(data: any, keys: string[]): void {
  const missing: string[] = [];
  for (const key of keys) {
    const isArray: boolean = key.indexOf("[]") !== -1;
    if (isArray) {
      const nKey: string = key.replace("[]", "");
      const value: any = data[nKey];
      if (value === undefined || value === null || value === "" || value.length === 0) {
        missing.push(nKey);
      }
    } else {
      if (data[key] === undefined || data[key] === null || data[key] === "") {
        missing.push(key);
      }
    }
  }
  if (missing.length > 0) {
    throw new HttpError(400, "Required data properties are missing.", {
      provided: data,
      required: keys,
      missing
    });
  }
}