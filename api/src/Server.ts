require("dotenv").config();

import "./Routes";

import { container as access } from "cmdo-access";
import { cors, route, server } from "cmdo-http";
import { ws } from "cmdo-socket";

import { AccessStore } from "./Providers/AccessStore";
import { mongo } from "./Services/Mongo";

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
  const httpServer = server([cors(), route()]);
  await ws.connect(httpServer, () => {});
  httpServer.listen(PORT, () => {
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
