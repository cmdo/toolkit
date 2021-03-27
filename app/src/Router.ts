import { createBrowserHistory, Route, Router } from "cmdo-router";
import type { Request, Response } from "cmdo-router";

import Dashboard from "./Views/Dashboard.svelte";
import Events from "./Views/Events.svelte";

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
  })
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
