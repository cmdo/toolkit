import { Route, router } from "cmdo-router";

import Dashboard from "./Views/Dashboard.svelte";
import Data from "./Views/Data.svelte";
import Events from "./Views/Events.svelte";

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
  })
]);

/*
 |--------------------------------------------------------------------------------
 | Middleware
 |--------------------------------------------------------------------------------
 */

// nothing ...
