import type { History } from "history";

import { ValueStore } from "./ValueStore";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type QueryObject = {
  [key: string]: string;
};

/*
 |--------------------------------------------------------------------------------
 | Query
 |--------------------------------------------------------------------------------
 */

export class Query extends ValueStore {
  public readonly history: History;

  /**
   * Create a new `Query` instance.
   *
   * @param history - History instance.
   * @param search  - Query search value.
   */
  constructor(history: History, search = "") {
    super(toQueryObject(search));
    this.history = history;
  }

  /**
   * Update the current query store, and triggers a history push to the
   * new location.
   *
   * @param key   - Key to update the value for.
   * @param value - Value to add to the key.
   */
  public set(key: string | QueryObject, value?: string | number): void {
    if (typeof key === "string") {
      this.replace({
        ...this.get(),
        [key]: String(value)
      });
    } else {
      this.replace({
        ...this.get(),
        ...key
      });
    }
  }

  /**
   * Remove provided key/value pair from the query store and triggers a
   * history push to the new location.
   *
   * @param key - Key to remove from the query.
   */
  public unset(key?: string | string[]): void {
    if (key !== undefined) {
      const current: any = { ...this.get() };
      if (Array.isArray(key)) {
        for (const k of key) {
          if (current[k] !== undefined) {
            delete current[k];
          }
        }
      } else {
        if (current[key] !== undefined) {
          delete current[key];
        }
      }
      this.replace(current);
    } else {
      this.replace({});
    }
  }

  /**
   * Replaces the entire query store with the provided replacement.
   *
   * @param store - Object to replace the current store with.
   */
  public replace(store: any): void {
    this.history.push({ search: toQueryString(store) });
  }

  /**
   * Converts the current query store to a query string.
   *
   * @returns query as a string, eg. ?foo=x&bar=y
   */
  public toString(): string {
    return toQueryString(this.get());
  }
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

/**
 * Takes a key/value pair object and generates a browser query string.
 *
 * @param store - key/value pair store to convert.
 *
 * @returns query string
 */
function toQueryString(obj: any): string {
  const query: string[] = [];
  for (const key in obj) {
    query.push(`${key}=${obj[key]}`);
  }
  if (query.length) {
    return `?${query.join("&")}`;
  }
  return "";
}

/**
 * Converts a search string to a object key/value pair.
 *
 * @param search - Search string to convert to object.
 */
function toQueryObject(search: string): any {
  const result: any = {};
  if (search) {
    search
      .replace("?", "")
      .split("&")
      .forEach((filter: string): void => {
        const [key, val] = filter.split(/=(.+)/);
        result[key] = val;
      });
  }
  return result;
}
