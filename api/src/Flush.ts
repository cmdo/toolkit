require("dotenv").config();

import { mongo } from "./Providers/Mongo";

/*
 |--------------------------------------------------------------------------------
 | Database Loader
 |--------------------------------------------------------------------------------
 */

async function database(): Promise<void> {
  await mongo.connect();
}

/*
 |--------------------------------------------------------------------------------
 | Main
 |--------------------------------------------------------------------------------
 */

async function main(): Promise<void> {
  await database();

  await mongo.db.dropDatabase();

  console.log("\nServer flushed\n");

  process.exit(0);
}

main();
