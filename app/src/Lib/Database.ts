import { getId, publisher } from "cmdo-domain";
import Loki from "lokijs";
import IncrementalIndexedDBAdapter from "lokijs/src/incremental-indexeddb-adapter";

import { container } from "../Container";
import type { EventDescriptor } from "../Providers/EventStore";
import type { TenantStore } from "../Services/TenantStore";
import { api } from "./Request";
import { socket } from "./Socket";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Collection = "events" | "users";

type RemoteEventDescriptor = {
  tenant: string;
  event: EventDescriptor;
  version: string;
};

/*
 |--------------------------------------------------------------------------------
 | Collections
 |--------------------------------------------------------------------------------
 */

const collections: Record<Collection, Partial<CollectionOptions<any>>> = {
  events: {
    unique: ["originId"],
    indices: ["id"],
    disableMeta: true
  },
  users: {
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
  const prevDb = getTenant();
  if (prevDb) {
    socket.off(`${prevDb.filename}:event`, handleEvent);
    prevDb.close();
  }
  if (!prevDb || prevDb.filename !== tenantId) {
    const nextDb = new Loki(tenantId, { adapter: new IncrementalIndexedDBAdapter() });
    container.set("TenantStore", nextDb);
    await loadTenantCollections(nextDb);
    socket.on(`${tenantId}:event`, handleEvent);
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

/*
 |--------------------------------------------------------------------------------
 | Synchronization
 |--------------------------------------------------------------------------------
 */

/**
 * Handle incoming event notification.
 *
 * @remarks
 *
 * If the originSocketId matches the current clients socket id, and the previous
 * local id is the one we have cached locally. We skip the syncing process since
 * we now know that the next local id came right after the last known local id.
 *
 * If the above use case is not valid then we check if the current local id is
 * younger than the next local id. If they do not match we are out of sync and
 * send another sync request to get back to parity.
 *
 * @param originSocketId - Socket id of the client that logged the event.
 * @param tenantId       - Tenant id in which the event was logged under.
 * @param prevLocalId    - Local id of the last known event before the next event.
 * @param nextLocalId    - Local id of the logged event.
 */
function handleEvent(originSocketId: string | undefined, tenantId: string, prevLocalId: string | undefined, nextLocalId: string) {
  const currentLocalId = localStorage.getItem(tenantId) || undefined;
  if (originSocketId === socket?.id && currentLocalId === prevLocalId) {
    localStorage.setItem(tenantId, nextLocalId);
  } else if (!currentLocalId || currentLocalId < nextLocalId) {
    sync(tenantId);
  }
}

/**
 * Request un-synced events from remote replica.
 *
 * @param tenantId - Tenant id to sync events for.
 */
export async function sync(tenantId: string): Promise<void> {
  const timestamp = localStorage.getItem(tenantId) || "";
  const res = await api.get<{ timestamp: string; events: RemoteEventDescriptor[] }>(`/tenants/${tenantId}/sync?timestamp=${timestamp}`);
  switch (res.status) {
    case "success": {
      localStorage.setItem(tenantId, res.data.timestamp);
      for (const descriptor of res.data.events) {
        addRemoteEvent(descriptor);
      }
      break;
    }
    case "error": {
      console.log(res);
      break;
    }
  }
}

/**
 * Add event from remote replica.
 *
 * @param remote - Remote event descriptor.
 */
function addRemoteEvent(remote: RemoteEventDescriptor, db = container.get("TenantStore")) {
  const collection = db.getCollection<EventDescriptor>("events");

  const count = collection.count({ originId: remote.event.originId });
  if (count > 0) {
    return console.log("Already have event, skipping ..."); // we already have the event ...
  }

  try {
    const event = collection.insertOne({ ...remote.event, localId: getId() });
    if (event) {
      publisher.publish(event);
    }
  } catch (error) {
    console.log("Fail to hydrate incoming event", error);
  }
}
