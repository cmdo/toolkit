import type { Action } from "cmdo-router";
import { createBrowserHistory, Route, Router } from "cmdo-router";

import Dashboard from "./Views/Dashboard.svelte";
import Docs from "./Views/Docs.svelte";

export const router = new Router(createBrowserHistory());

/*
 |--------------------------------------------------------------------------------
 | Routes
 |--------------------------------------------------------------------------------
 */

//#region

router.register([new Route("/", [setTitle("Dashboard"), render(Dashboard)]), new Route("/docs", [setTitle("Docs"), render(Docs)])]);

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Actions
 |--------------------------------------------------------------------------------
 */

//#region

function setTitle(title: string): Action {
  return async function () {
    document.title = title;
    return this.accept();
  };
}

function render(component: any): Action {
  return async function () {
    return this.render([component]);
  };
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region

export function getTitle(): string {
  return document.title;
}

//#endregion
