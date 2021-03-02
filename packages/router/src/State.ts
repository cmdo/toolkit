export class State {
  private store: any;

  /**
   * Initializes a new State instance.
   *
   * @param state - State object. Default: {}
   */
  constructor(store?: any) {
    this.store = store || {};
  }

  /**
   * Add additional state properties to ValueStore.
   *
   * @param key   - Key to store value under.
   * @param value - Value to store under provided key.
   */
  public set(key: string, value: any): void {
    this.store[key] = value;
  }

  /**
   * Returns value in provided key, or the entire store.
   *
   * @param key - Key to return if defined.
   *
   * @returns Key value as provided T
   */
  public get<T>(key: string): T {
    return this.store[key];
  }
}
