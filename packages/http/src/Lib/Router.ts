import type { IncomingMessage } from "http";

import { HttpMethod, RequestState } from "../Types";
import * as policyResponse from "./Policy";
import { HttpError, HttpRedirect, HttpSuccess } from "./Response";
import { Route } from "./Route";

const resolveBody = new Set(["POST", "PUT", "PATCH"]);

export class Router {
  public routes: Routes = {
    post: [],
    get: [],
    put: [],
    patch: [],
    delete: []
  };

  /**
   * Registers provided routes with the router.
   *
   * @param routes - List of routes to register with the router.
   */
  public register(routes: Route[]) {
    for (const route of routes) {
      this.routes[route.method].push(route);
    }
  }

  /**
   * Resolve request into a http response.
   *
   * @param message - Incoming http message.
   */
  public async resolve(message: IncomingMessage): Promise<HttpSuccess | HttpRedirect | HttpError> {
    if (!message.url || !message.method) {
      return new HttpError(500, "Internal error");
    }

    // ### Routes
    // Get list of routes available for the request method.

    const routes = this.routes[message.method.toLowerCase() as HttpMethod];
    if (!routes) {
      return new HttpError(500, "Unsupported method type.", { method: message.method });
    }

    // ### Find Route
    // Find route in the list of available routes.

    const [path, search] = message.url.split("?");
    const result = this.get(routes, path);
    if (!result) {
      return new HttpError(404, "Route does not exist, or has been removed.", { url: message.url });
    }

    const route = result.route;

    // ### Message State
    // Parse the message param, query and body.

    message.params = getParams(result);
    message.query = search ? getQuery(search) : {};
    message.body = resolveBody.has(message.method) ? await this.body(message) : {};

    // ### Policies
    // If policies has been defined, validate each policy before assigning
    // and routing the request.

    for (const policy of route.policies) {
      const response = await policy.call(policyResponse, message);
      switch (response.status) {
        case "accepted": {
          continue; // policy accepted, check next policy ...
        }
        case "redirect": {
          return new HttpRedirect(response.url, response.type);
        }
        case "rejected": {
          return new HttpError(response.code, response.message, response.data);
        }
      }
    }

    // ### Render
    // Execute the defined render handler.

    if (route.handler) {
      return route.handler(message);
    }

    return new HttpSuccess();
  }

  /**
   * Parse the incoming request body.
   *
   * @param req - Incoming http request.
   *
   * @returns Parsed http body
   */
  public async body(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let data: any = [];

      req.on("data", chunk => {
        data.push(chunk);
      });

      req.on("error", err => {
        reject(err);
      });

      req.on("end", () => {
        resolve(JSON.parse(data));
      });
    });
  }

  /**
   * Returns a route that validates against the given path.
   *
   * @param routes - List of method routes.
   * @param path   - Routing path to return.
   *
   * @returns route or undefined
   */
  public get(routes: Route[], path: string): Result | undefined {
    for (const route of routes) {
      const match: boolean = route.match(path);
      if (match) {
        return { route, match };
      }
    }
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
 * @param result - Route result.
 *
 * @returns Request parameters
 */
export function getParams(result: Result): RequestState {
  const routeParams = result.route.params;
  const params: any = {};
  let index = 1;
  for (const routeParam of routeParams) {
    params[routeParam.name] = result.match[index];
    index += 1;
  }
  return params;
}

/**
 * Converts a search string to a object key/value pair.
 *
 * @param search - Search string to convert to object.
 */
export function getQuery(search = ""): any {
  const result: any = {};
  if (search) {
    search
      .replace("?", "")
      .split("&")
      .forEach((filter: string): void => {
        const [key, val] = filter.split(/=(.+)/);
        result[key] = val;
      });
  }
  return result;
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

/**
 * Http methods mapped to route lists.
 */
type Routes = {
  post: Route[];
  get: Route[];
  put: Route[];
  patch: Route[];
  delete: Route[];
};

/**
 * Result of a route search when resolving a request.
 */
export type Result = {
  route: Route;
  match: any;
};
