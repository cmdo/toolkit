import { Query } from "./Query";
import { Route } from "./Route";
import { ValueStore } from "./ValueStore";

export const responses: Responses = {
  /**
   * Generates a policy accept response.
   *
   * @returns accept response
   */
  accept(): Accept {
    return {
      status: "accept"
    };
  },

  /**
   * Generates a policy redirect response.
   *
   * @param path - Redirect path.
   * @param isExternal - Should the redirect go to a 3rd party resource?
   *
   * @returns redirect response
   */
  redirect(path: string, isExternal = false): Redirect {
    return {
      status: "redirect",
      isExternal,
      path
    };
  },

  /**
   * Generates a policy reject response.
   *
   * @param message - Message detailing the rejection.
   * @param details - (Optional) Additional error details.
   *
   * @returns reject response
   */
  reject(message: string, details: any = {}): Reject {
    return {
      status: "reject",
      message,
      details
    };
  }
};

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

/**
 * Route policy executed before a route is committed to the router.
 *
 * @param req - Next router request object.
 *
 * @returns Policy response object
 */
export type Policy = (this: Responses, req: Request) => Promise<Accept | Redirect | Reject>;

/**
 * Router request containing the route, query, params and history state.
 */
type Request = {
  route: Route;
  query: Query;
  params: ValueStore;
  state: ValueStore;
};

/**
 * List of methods that returns a valid policy response object.
 */
type Responses = {
  accept(): Accept;
  redirect(path: string, isExternal?: boolean): Redirect;
  reject(message: string, details?: any): Reject;
};

/**
 * Accept response object.
 */
type Accept = {
  status: "accept";
};

/**
 * Redirect response object.
 */
type Redirect = {
  status: "redirect";
  isExternal: boolean;
  path: string;
};

/**
 * Reject response object.
 */
type Reject = {
  status: "reject";
  message: string;
  details: any;
};
