import { RouterError } from "./Error";
import type { History, Location } from "./History";
import { responses } from "./Policy";
import { Query } from "./Query";
import { Route } from "./Route";
import { ValueStore } from "./ValueStore";

/**
 * Framework agnostic router for single page applications.
 *
 * @author  Christoffer Rødvik <dev@kodemon.net>
 * @license MIT
 */
export class Router {
  public readonly history: History;
  public readonly base: string;

  public routes: Route[] = [];
  public query: Query;
  public params: ValueStore;
  public state: ValueStore;
  public route?: Route;
  public unregister?: () => void;

  /**
   * Initializes a new `Router` instance.
   *
   * @param history  - History instance.
   * @param settings - Router settings.
   */
  constructor(history: History, { base }: Settings = {}) {
    this.base = getBase(base);
    this.history = history;
    this.query = new Query(history);
    this.params = new ValueStore();
    this.state = new ValueStore();
  }

  /**
   * Get the current location from the history instance.
   *
   * @returns history.location
   */
  public get location(): Location {
    return this.history.location;
  }

  /**
   * Registers provided routes with the router.
   *
   * @param routes - List of routes to register with the router.
   *
   * @returns Router
   */
  public register(routes: Route[]) {
    for (const route of routes) {
      this.routes.push(route.base(this.base));
    }
    return this;
  }

  /**
   * Start listening to transition requests.
   *
   * @param options - Router options.
   *
   * @returns Router
   */
  public listen(options: Options) {
    let locations: Location[] = [];

    // ### Unregister
    // If there an existing history listener, unregister it before creating
    // a new listener.

    if (this.unregister) {
      this.unregister();
    }

    // ### Listen
    // Create a new history listener for the router.

    this.unregister = this.history.listen(async ({ location }) => {
      if (locations.length > 1) {
        locations.shift();
      }
      locations.push(location);

      // ### Resolve Location

      const result = this.get(location.pathname);
      if (result) {
        const route = result.route;
        const state = new ValueStore(location.state);
        const query = new Query(this.history, location.search);
        const params = getParams(result);

        // ### Policies
        // If policies has been defined, validate each policy before assigning
        // and routing the request.

        for (const policy of route.policies) {
          try {
            const res = await policy.call(responses, { route, query, params, state });
            switch (res.status) {
              case "accept": {
                break;
              }
              case "reject": {
                return options.error(new RouterError(res.message, res.details));
              }
              case "redirect": {
                if (res.isExternal) {
                  return window.location.replace(res.path);
                }
                return this.goTo(res.path, { origin: locations[0] });
              }
            }
          } catch (err) {
            return options.error(err);
          }
        }

        // ### Update Router
        // Set the new location, query, params, and route to the router.

        this.route = route;
        this.state = state;
        this.query = query;
        this.params = params;

        // ### Render
        // Send route request to the registered render handler.

        options.render(route, location).catch(options.error);
      } else {
        options.error(
          new RouterError("Route does not exist, or has been moved to another location.", {
            status: 404,
            code: "ROUTE_NOT_FOUND"
          })
        );
      }
    });
    return this;
  }

  /**
   * Redirect the client to the provided pathname/link.
   *
   * @param path - Path to route to.
   * @param state - State to deliver with the route.
   */
  public goTo(path: string, state: any = {}) {
    this.history.push((this.base + path.replace(this.base, "")).replace(/\/$/, ""), state);
  }

  /**
   * Returns a route that validates against the given path.
   *
   * @param path - Routing path to return.
   *
   * @returns Result or undefined
   */
  public get(path: string): Result | undefined {
    for (const route of this.routes) {
      const match: boolean = route.match(path);
      if (match) {
        return { route, match };
      }
    }
    return undefined;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Utilties
 |--------------------------------------------------------------------------------
 */

/**
 * Retrieve routing parameters from the provided route result container.
 *
 * @param container - Route result container.
 *
 * @returns Parameter value store
 */
function getParams(container: Result): ValueStore {
  const params = container.route.params;
  const result: any = {};
  let index = 1;
  for (const param of params) {
    result[param.name] = container.match[index];
    index += 1;
  }
  return new ValueStore(result);
}

/**
 * Get a router base path for subdirectory support.
 *
 * @remarks
 * This mainly serves to ensure a valid base for invalid root values.
 *
 * @param path - Path to provide as base.
 *
 * @returns Base path
 */
function getBase(path?: string): string {
  if (!path || path === "" || path === "/") {
    return "";
  }
  return path;
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type Settings = {
  /**
   * Setting the base attribute tells the router that the app
   * is being served from a subdirectory.
   */
  base?: string;
};

type Options = {
  /**
   * Render routed view template and component.
   *
   * @param route - Route to render.
   * @param location - Current history location.
   */
  render(route: Route, location: Location, forced?: boolean): Promise<void>;

  /**
   * Handles an error that occurs during a routing request.
   *
   * @param error - Error reported during invalid routing.
   */
  error(error: any): void;
};

type Result = {
  route: Route;
  match: any;
};
