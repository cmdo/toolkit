/**
 * ValueStore provides the ability to cleanly access object state
 * values in a isomorphic manner.
 *
 * @class
 */
export class ValueStore {
  public readonly store: Store;

  /**
   * Initializes a new `ValueStore` instance.
   *
   * @param state - State object.
   */
  constructor(state: any = {}) {
    this.store = Object.freeze(state);
  }

  /**
   * Returns the empty state of the current state store.
   *
   * @returns 'true' if query is empty, 'false' if one or more values exist
   */
  public isEmpty(): boolean {
    return Object.keys(this.store).length === 0;
  }

  /**
   * Returns a boolean state of the provided keys existence.
   *
   * @param key - Check if the query has the provided key.
   *
   * @returns 'true' if the key exist, 'false' if it does not.
   */
  public has(key: string): boolean {
    return this.store[key] ? true : false;
  }

  /**
   * Returns value in provided key, or the entire store.
   *
   * @param key - Key to return if defined.
   *
   * @returns entire query object if no key is provided, else value of the key
   */
  public get(): Store;
  public get<T = any>(key: string): T | undefined;
  public get<T = any>(key?: string): Store | T | undefined {
    if (typeof key === "string") {
      return this.store[key];
    } else {
      return this.store;
    }
  }
}

type Store = {
  [key: string]: any;
};
