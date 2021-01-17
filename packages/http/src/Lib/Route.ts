import type { IncomingMessage } from "http";

import type { HttpMethod } from "../Types";
import { pathToRegexp } from "../Utils/PathToRegexp";
import type { Policy } from "./Policy";
import type { HttpError, HttpRedirect, HttpSuccess } from "./Response";

export class Route {
  public readonly method: HttpMethod;
  public readonly path: string;
  public readonly regExp: RegExp;
  public readonly params: Parameter[];
  public readonly policies: Policy[];
  public readonly handler: Handler;

  /**
   * Creates a new Route instance.
   *
   * @param components - Components to render when route is executed.
   * @param options - Routing options.
   */
  constructor(options: Options) {
    this.method = options.method;
    this.path = options.path;
    this.regExp = pathToRegexp(options.path);
    this.params = parseParams(options.path);
    this.policies = options.policies || [];
    this.handler = options.handler;
  }

  /**
   * Matches the route against provided path.
   *
   * @param path - Path to match against.
   *
   * @returns matched regex path with params
   */
  public match(path: string): any {
    return this.regExp.exec(path);
  }
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

/**
 * Parse parameters for the provided path.
 *
 * @param path - Path to extract routing parameters from.
 *
 * @returns route parameters
 */
function parseParams(path: string): Parameter[] {
  return path.split("/").reduce((list: Parameter[], next: string) => {
    if (next.match(/:/)) {
      list.push({
        name: next.replace(":", ""),
        value: undefined
      });
    }
    return list;
  }, []);
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type Options = {
  method: HttpMethod;
  path: string;
  policies?: Policy[];
  handler: Handler;
};

type Parameter = {
  name: string;
  value?: string;
};

export type Handler = (req: IncomingMessage) => Promise<HttpSuccess | HttpRedirect | HttpError>;
