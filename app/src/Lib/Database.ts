import { EventDescriptor, getId, publisher } from "cmdo-domain";
import Loki from "lokijs";
import IncrementalIndexedDBAdapter from "lokijs/src/incremental-indexeddb-adapter";

import { container } from "../Container";
import type { TenantStore } from "../Services/TenantStore";
import { orderByOriginId } from "../Utils/Sort";
import { socket } from "./Socket";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Collection = "events" | "samples" | "weeks" | "items";

/*
 |--------------------------------------------------------------------------------
 | Collections
 |--------------------------------------------------------------------------------
 */

const collections: Record<Collection, Partial<CollectionOptions<any>>> = {
  events: {
    unique: ["version", "event.meta.oid"],
    indices: ["id"],
    disableMeta: true
  },
  samples: {
    unique: ["id"],
    disableMeta: true
  },
  weeks: {
    unique: ["id"],
    disableMeta: true
  },
  items: {
    unique: ["id"],
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
  const name = `tenant-${tenantId}`;
  const prevDb = getTenant();
  if (prevDb) {
    socket.off(`${prevDb.filename}:event`, handleEvent);
    prevDb.close();
  }
  if (!prevDb || prevDb.filename !== name) {
    const nextDb = new Loki(name, { adapter: new IncrementalIndexedDBAdapter() });
    container.set("TenantStore", nextDb);
    await loadTenantCollections(nextDb);
    socket.on(`${name}:event`, handleEvent);
  }
}

/**
 * Delete tenant container.
 *
 * @param tenantId - Tenant id to delete.
 */
export async function deleteTenant(tenantId: string) {
  const name = `tenant-${tenantId}`;
  const db = getTenant();
  if (db && db.filename === name) {
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

/**
 * Handle incoming event requests.
 *
 * @param descriptor - Event descriptor.
 */
function handleEvent(descriptor: EventDescriptor, db = container.get("TenantStore")) {
  const collection = db.getCollection("events");

  const count = collection.count({ "event.meta.oid": descriptor.event.meta.oid });
  if (count > 0) {
    console.log("Already have event, skipping ...");
    return; // we already have the event ...
  }

  const events = collection.find({ id: descriptor.id, "event.type": descriptor.event.type }).sort(orderByOriginId);
  const version = collection.count({ id: descriptor.id });

  const last = events[events.length - 1];
  if (!last || last.event.meta.oid < descriptor.event.meta.oid) {
    descriptor.event.meta.lid = getId();
    try {
      const message = collection.insertOne({ ...descriptor, version: `${descriptor.id}-${version + 1}` });
      if (message) {
        publisher.publish(message.event);
      }
    } catch (error) {
      console.log("Fail to hydrate incoming event", error);
    }
  }
}
