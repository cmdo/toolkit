import { collections } from "./Collections";
import type { Database } from "./Types";

export async function loadData(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, (err: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function loadCollections(db: Database) {
  for (const [name, options] of Object.entries(collections)) {
    const col = db.getCollection(name as keyof typeof collections);
    if (col === null) {
      db.addCollection(name, options);
    }
  }
}
