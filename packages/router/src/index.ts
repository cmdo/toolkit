import { Router } from "./Router";

export type { Before, Request, Response } from "./Before";
export { Route } from "./Route";
export { createBrowserHistory, createHashHistory, createMemoryHistory } from "history";

export const router = new Router();
