import type { Route } from "./Route";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Resolved = {
  route: Route;
  match: any;
};

/*
 |--------------------------------------------------------------------------------
 | Routes
 |--------------------------------------------------------------------------------
 */

export const routes: Set<Route> = new Set();

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

export function addRoute(base: string, route: Route): void {
  routes.add(route.base(base));
}

export function getRoute(path: string): Resolved | undefined {
  for (const route of Array.from(routes.values())) {
    const match: boolean = route.match(path);
    if (match) {
      return { route, match };
    }
  }
  return undefined;
}
