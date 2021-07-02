import type { Collection } from "./Collections";

export declare class Database extends Loki {
  public getCollection<F extends Record<string, any> = any>(collectionName: Collection): LokiConstructor.Collection<F>;
}
