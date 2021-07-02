import Loki from "lokijs";
import IncrementalIndexedDBAdapter from "lokijs/src/incremental-indexeddb-adapter";

import { setDatabase, unsetDatabase } from "./Database/Utils";
import { sync } from "./Sync";

let streamId: string | undefined;

export async function setStream(id: string): Promise<void> {
  if (streamId) {
    unsetDatabase(streamId);
    sync.off(streamId);
  }
  streamId = id;
  await setDatabase(new Loki(streamId, { adapter: new IncrementalIndexedDBAdapter() }));
  sync.on(streamId);
}

export function getStreamId(): string {
  if (!streamId) {
    throw new Error("Tenant Violation > No active tenant id has been assigned.");
  }
  return streamId;
}

export function delStreamId(): void {
  streamId = undefined;
}
