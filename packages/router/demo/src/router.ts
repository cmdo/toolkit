import { createBrowserHistory, Router } from "cmdo-router";

export type { Before, Request, Response } from "cmdo-router";
export { Route } from "cmdo-router";

export const router = new Router(createBrowserHistory(), { base: "/app" });
