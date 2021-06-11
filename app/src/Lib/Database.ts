import Loki from "lokijs";
import IncrementalIndexedDBAdapter from "lokijs/src/incremental-indexeddb-adapter";

import { container } from "../Container";
import type { Tenant } from "../Services/Tenant";
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

export async function loadTenant(tenantId: string): Promise<void> {
  const current = getCurrentTenant();
  if (current) {
    if (current.filename === tenantId) {
      return; // tenant has not changed, no reason to re-load
    }
    sync.off(current.filename);
    current.close();
  }
  const next = new Loki(tenantId, { adapter: new IncrementalIndexedDBAdapter() });
  container.set("Tenant", next);
  await loadTenantCollections(next);
  sync.on(tenantId);
}

async function loadTenantCollections(db: Tenant): Promise<void> {
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

function getCurrentTenant(): Tenant | undefined {
  try {
    return container.get("Tenant");
  } catch (error) {
    // dependency requests which has not yet been defined comes back as errors, we suppress these errors
    // and return undefined when a dependency has yet to be registered.
  }
}

export async function deleteTenant(tenantId: string): Promise<void> {
  const current = getCurrentTenant();
  if (current && current.filename === tenantId) {
    current.deleteDatabase();
  }
}
