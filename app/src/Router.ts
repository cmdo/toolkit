import type { Action } from "cmdo-router";
import { createBrowserHistory, Route, Router } from "cmdo-router";

import Dashboard from "./Views/Dashboard.svelte";
import Data from "./Views/Data.svelte";
import Events from "./Views/Events.svelte";

export const router = new Router(createBrowserHistory());

/*
 |--------------------------------------------------------------------------------
 | Routes
 |--------------------------------------------------------------------------------
 */

router.register([
  new Route("/", [setTitle("Dashboard"), render(Dashboard)]),
  new Route("/events", [setTitle("Events"), render(Events)]),
  new Route("/data", [setTitle("Data"), render(Data)])
]);

/*
 |--------------------------------------------------------------------------------
 | Actions
 |--------------------------------------------------------------------------------
 */

function render(component: any): Action {
  return async function () {
    return this.render([component]);
  };
}

function setTitle(title: string): Action {
  return async function () {
    document.title = title;
    return this.accept();
  };
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

export function getTitle(): string {
  return document.title;
}
