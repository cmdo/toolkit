import type { Token } from "cmdo-inverse";

import type { Collection } from "../Lib/Database";

/*
 |--------------------------------------------------------------------------------
 | Declare Database
 |--------------------------------------------------------------------------------
 |
 | Declare data specific data types onto the loki service dependency.
 |
 */

export declare class Tenant extends Loki {
  // eslint-disable-next-line @typescript-eslint/ban-types
  public getCollection<F extends object = any>(collectionName: Collection): LokiConstructor.Collection<F>;
}

/*
 |--------------------------------------------------------------------------------
 | Token
 |--------------------------------------------------------------------------------
 */

export type TenantToken = Token<{ new (): Tenant }, Tenant>;
