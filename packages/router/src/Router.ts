import EventEmitter from "eventemitter3";
import { createBrowserHistory, History, Location } from "history";

import { response } from "./Before";
import { Query } from "./Query";
import { Route } from "./Route";
import { State } from "./State";
import { ValueStore } from "./ValueStore";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

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
   * @param error - Routing error.
   */
  error(error: MiddlewareError | NotFoundError): void;
};

type Result = {
  route: Route;
  match: any;
};

/*
 |--------------------------------------------------------------------------------
 | Router
 |--------------------------------------------------------------------------------
 */

export class Router extends EventEmitter {
  private base = "";
  private history = createBrowserHistory();

  public routes: Map<string, Route> = new Map();
  public route?: Route;

  public query: Query;
  public params: ValueStore;
  public state: State;

  public unregister?: () => void;

  constructor() {
    super();
    this.base = "";
    this.history = createBrowserHistory();
    this.query = new Query(this.history);
    this.params = new ValueStore();
    this.state = new State();
  }

  public get location(): Location {
    return this.history.location;
  }

  /**
   * Set a new history instance.
   *
   * @param history - History instance.
   *
   * @returns Router
   */
  public setHistory(history: History): this {
    this.history = history;
    return this;
  }

  /**
   * Set base application path.
   *
   * @param path - Base path.
   *
   * @returns Router
   */
  public setBase(path: string): this {
    this.base = path === "" || path === "/" ? "" : path;
    return this;
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
      this.routes.set(route.id, route.base(this.base));
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
    const locations: Location[] = [];

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
        const state = new State(location.state);
        const query = new Query(this.history, location.search);
        const params = getParams(result);

        // ### Initial Progress

        const total = route.before.length;
        if (total > 0) {
          if (total === 1) {
            this.emit("progress", 50);
          } else {
            this.emit("progress", 5);
          }
        }

        // ### Middleware

        let index = 1;
        for (const before of route.before) {
          try {
            const res = await before.call(response, { route, query, params, state });
            switch (res.status) {
              case "accept": {
                break;
              }
              case "reject": {
                return options.error(new MiddlewareError(res.message, res.details));
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
          index += 1;
          this.emit("progress", (index / total) * 100);
        }

        // ### Update Router

        this.route = route;
        this.state = state;
        this.query = query;
        this.params = params;

        // ### Render

        options.render(route, location).catch(options.error);

        // ### Afterware

        for (const after of route.after) {
          after({ route, query, params, state });
        }
      } else {
        options.error(new NotFoundError(location.pathname));
      }

      this.emit("progress", 0);
    });
    return this;
  }

  /**
   * Redirect the client to the provided pathname/link.
   *
   * @param path  - Path to route to.
   * @param state - State to deliver with the route.
   */
  public goTo(path: string, state: any = {}): void {
    const parts = (this.base + path.replace(this.base, "")).replace(/\/$/, "").split("?");
    this.history.push(
      {
        pathname: parts[0] || "/",
        search: parts[1] ? `?${parts[1]}` : ""
      },
      state
    );
  }

  /**
   * Returns a route that validates against the given path.
   *
   * @param path - Routing path to return.
   *
   * @returns Result or undefined
   */
  public get(path: string): Result | undefined {
    for (const route of Array.from(this.routes.values())) {
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
 | Errors
 |--------------------------------------------------------------------------------
 */

/**
 * Creates a new MiddlewareError
 *
 * @classdesc
 * Informs the client that the middleware encountered a failure event
 * and couldn't render the requested route.
 */
class MiddlewareError extends Error {
  public readonly type = "MiddlewareError" as const;

  public readonly details: any;

  constructor(message: string, details: any = {}) {
    super(message);
    this.details = details;
  }
}

/**
 * Creates a new NotFoundError
 *
 * @classdesc
 * Informs the client that the requested location does not have a valid
 * route assigned to it.
 */
class NotFoundError extends Error {
  public readonly type = "NotFoundError" as const;

  public readonly path: any;

  constructor(path: string) {
    super("Route does not exist, or has been moved to another location.");
    this.path = path;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
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
