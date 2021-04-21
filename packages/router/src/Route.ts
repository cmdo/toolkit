import { pathToRegexp } from "path-to-regexp";

import type { Before, Request } from "./Before";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type After = (req: Request) => Promise<void>;

/**
 * Key/Value parameter definition.
 */
type Parameter = {
  name: string;
  value?: string;
};

type Options = {
  /**
   * Identifier, useful for determine active route in app components.
   */
  id: string;

  /**
   * Route title, usually for setting the document title of the page.
   */
  title: string;

  /**
   * Raw routing path, eg. /users/:slug
   */
  path: string;

  /**
   * Middleware to run before executing the route.
   */
  before?: Before[];

  /**
   * Handlers to run after the route has been resolved.
   */
  after?: After[];
};

/*
 |--------------------------------------------------------------------------------
 | Route
 |--------------------------------------------------------------------------------
 */

export class Route {
  public components: any[] = [];

  public id: string;
  public title: string;
  public path: string;
  public before: Before[];
  public after: After[];

  public regExp: RegExp;
  public params: Parameter[];

  /**
   * Initializes a new `Route` instance.
   *
   * @param components - Components to output to application rendering engine.
   * @param options    - Routing options.
   */
  constructor(components: any | any[], options: Options) {
    this.components = Array.isArray(components) ? components : [components];

    this.regExp = pathToRegexp(options.path);
    this.params = parseParams(options.path);

    this.id = options.id;
    this.title = options.title;
    this.path = options.path.replace(/\/$/, "");
    this.before = options.before || [];
    this.after = options.after || [];
  }

  /**
   * Set base path for the route.
   *
   * @param path - Base path.
   *
   * @returns Route
   */
  public base(path = ""): this {
    this.regExp = pathToRegexp(path + this.path);
    return this;
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
