import { createBrowserHistory, Route, Router } from "cmdo-router";
import type { Request, Response } from "cmdo-router";

import Dashboard from "./Views/Dashboard.svelte";
import Events from "./Views/Events.svelte";
import Data from "./Views/Data.svelte";

const router = new Router(createBrowserHistory());

/*
 |--------------------------------------------------------------------------------
 | Routes
 |--------------------------------------------------------------------------------
 */

router.register([
  new Route(Dashboard, {
    title: "Dashboard",
    id: "dashboard",
    path: "/"
  }),
  new Route(Events, {
    title: "Events",
    id: "events",
    path: "/events"
  }),
  new Route(Data, {
    title: "Data",
    id: "data",
    path: "/data"
  }),
]);

/*
 |--------------------------------------------------------------------------------
 | Middleware
 |--------------------------------------------------------------------------------
 */

// nothing ...

/*
 |--------------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------------
 */

export type { Request, Response };

export { router };
