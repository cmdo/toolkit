import Loki from "lokijs";
import IncrementalIndexedDBAdapter from "lokijs/src/incremental-indexeddb-adapter";

import { setDatabase, unsetDatabase } from "./Database/Utils";
import { sync } from "./Sync";

let tenantId: string | undefined;

export async function setTenant(id: string): Promise<void> {
  if (tenantId) {
    unsetDatabase(tenantId);
    sync.off(tenantId);
  }
  tenantId = id;
  await setDatabase(new Loki(tenantId, { adapter: new IncrementalIndexedDBAdapter() }));
  sync.on(tenantId);
}

export function getTenantId(): string {
  if (!tenantId) {
    throw new Error("Tenant Violation > No active tenant id has been assigned.");
  }
  return tenantId;
}

export function delTenantId(): void {
  tenantId = undefined;
}
