/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type Store = {
  [key: string]: any;
};

/*
 |--------------------------------------------------------------------------------
 | Value Store
 |--------------------------------------------------------------------------------
 */

export class ValueStore {
  private readonly _store: Store;

  constructor(state?: any) {
    this._store = Object.freeze(state || {});
  }

  public has(key: string): boolean {
    return this._store[key] !== undefined;
  }

  public get(): Store;
  public get<T = any>(key: string): T | undefined;
  public get<T = any>(key?: string): Store | T | undefined {
    if (key !== undefined) {
      return this._store[key];
    }
    return this._store;
  }
}
