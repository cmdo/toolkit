require("dotenv").config();

import "./Routes";

import { container as access } from "cmdo-access";

import { AccessStore } from "./Providers/AccessStore";
import { hts } from "./Providers/HttpServer";
import { mongo } from "./Providers/Mongo";
import { wss } from "./Providers/WebSocketServer";

const PORT = 8370;

/*
 |--------------------------------------------------------------------------------
 | Database Loader
 |--------------------------------------------------------------------------------
 |
 | Establish a connection to the database that is kept alive while the server
 | is running.
 | 
 */

async function database(): Promise<void> {
  await mongo.connect();
}

/*
 |--------------------------------------------------------------------------------
 | Dependency Injectors
 |--------------------------------------------------------------------------------
 |
 | Register service providers for module dependencies.
 |
 */

async function providers(): Promise<void> {
  access.set("AccessStore", new AccessStore());
}

/*
 |--------------------------------------------------------------------------------
 | Start
 |--------------------------------------------------------------------------------
 |
 | Start the http server instance and listen for requests.
 |
 */

async function start(): Promise<void> {
  wss.connect(hts);
  hts.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

/*
 |--------------------------------------------------------------------------------
 | Main
 |--------------------------------------------------------------------------------
 */

async function main(): Promise<void> {
  await database();
  await providers();
  await start();
}

main();
