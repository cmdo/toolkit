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
 | State
 |--------------------------------------------------------------------------------
 */

export class State {
  private _store: Store;

  constructor(store: any = {}) {
    this._store = store;
  }

  public set(key: string, value: any): void {
    this._store[key] = value;
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
