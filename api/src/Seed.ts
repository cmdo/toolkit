require("dotenv").config();

import "./Projections";

import { container as access } from "cmdo-access";

import { AccessStore } from "./Providers/AccessStore";
import { mongo } from "./Services/Mongo";

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
 | Seed
 |--------------------------------------------------------------------------------
 |
 | Starts executing the seed operations. Since we are working in a decoupled
 | environment you have to confirm that all operations have stopped processing
 | data and manually exit the instance once completed.
 |
 */

async function seed(): Promise<void> {
  await database();
  await providers();
}

seed();
