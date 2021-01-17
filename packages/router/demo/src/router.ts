import { createBrowserHistory, Router } from "cmdo-router";

export type { Policy } from "cmdo-router";
export { Route } from "cmdo-router";

export const router = new Router(createBrowserHistory(), { base: "/app" });
