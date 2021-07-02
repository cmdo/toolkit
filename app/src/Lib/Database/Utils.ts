import type { Collection } from "./Collections";
import { loadCollections, loadData } from "./Loaders";
import type { Database } from "./Types";

const database = new Map<string, Database>();
const debounce = new Map<string, NodeJS.Timeout>();

/*
 |--------------------------------------------------------------------------------
 | Database Utilities
 |--------------------------------------------------------------------------------
 */

export async function setDatabase(db: Database): Promise<void> {
  database.set(db.filename, db);
  await loadData(db);
  loadCollections(db);
}

export function saveDatabase(name: string): void {
  const db = database.get(name);
  if (db) {
    clearTimeout(debounce.get(name));
    debounce.set(
      name,
      setTimeout(() => {
        db.save();
      }, 500)
    );
  }
}

export function getDatabase(name: string): Database {
  const db = database.get(name);
  if (!db) {
    throw new Error("Database Violation > No active database has been registered.");
  }
  return db;
}

export function unsetDatabase(name: string): void {
  const db = database.get(name);
  if (db) {
    db.close();
    database.delete(name);
  }
}

export function deleteDatabase(name: string): void {
  const db = database.get(name);
  if (db) {
    db.deleteDatabase();
  }
}

/*
 |--------------------------------------------------------------------------------
 | Collection Utilities
 |--------------------------------------------------------------------------------
 */

export function getCollection<T = any>(dbName: string, collectionName: Collection) {
  return getDatabase(dbName).getCollection<T>(collectionName);
}
