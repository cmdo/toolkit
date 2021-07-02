import EventEmitter from "eventemitter3";

import type { Collection } from "./Database/Collections";
import type { Action } from "./Model";

export const events = {
  database: new (class DatabaseEvent extends EventEmitter<{
    save: (name: string) => void;
  }> {})(),
  model: new (class DatabaseEvent extends EventEmitter<
    {
      [collection in Collection]: (action: Action<any>) => void;
    }
  > {})()
};
