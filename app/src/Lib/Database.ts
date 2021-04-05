import Loki from "lokijs";
import IncrementalIndexedDBAdapter from "lokijs/src/incremental-indexeddb-adapter";

import { container } from "../Container";
import type { TenantStore } from "../Services/TenantStore";
import { sync } from "./Sync";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Collection = "events" | "users";

/*
 |--------------------------------------------------------------------------------
 | Collections
 |--------------------------------------------------------------------------------
 */

const collections: Record<Collection, Partial<CollectionOptions<any>>> = {
  events: {
    unique: ["originId", "version"],
    clone: true,
    disableMeta: true
  },
  users: {
    unique: ["id"],
    clone: true,
    disableMeta: true
  }
};

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

/**
 * Load a tenant container storing read collections and write events.
 *
 * @param tenantId - Tenant id to load.
 */
export async function loadTenant(tenantId: string): Promise<void> {
  const prevDb = getTenant();
  if (prevDb) {
    sync.off(prevDb.filename);
    prevDb.close();
  }
  if (!prevDb || prevDb.filename !== tenantId) {
    const nextDb = new Loki(tenantId, { adapter: new IncrementalIndexedDBAdapter() });
    container.set("TenantStore", nextDb);
    await loadTenantCollections(nextDb);
    sync.on(tenantId);
  }
}

/**
 * Delete tenant container.
 *
 * @param tenantId - Tenant id to delete.
 */
export async function deleteTenant(tenantId: string): Promise<void> {
  const db = getTenant();
  if (db && db.filename === tenantId) {
    db.deleteDatabase();
  }
}

/**
 * Get the tenant container currently injected into the dependency layer.
 *
 * @returns TenantStore or undefined.
 */
function getTenant(): TenantStore | undefined {
  try {
    return container.get("TenantStore");
  } catch (error) {
    // suppress dependency errors ...
  }
}

/**
 * Load tenant collections for the provided tenant store.
 *
 * @param db - Tenant store database to load collections for.
 */
async function loadTenantCollections(db: TenantStore): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, (err: Error) => {
      if (err) {
        return reject(err);
      }
      for (const [name, options] of Object.entries(collections)) {
        const col = db.getCollection(name as keyof typeof collections);
        if (col === null) {
          db.addCollection(name, options);
        }
      }
      resolve();
    });
  });
}
