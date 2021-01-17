import { Policy } from "./Policy";
import { pathToRegexp } from "./Utils";

/**
 * Represent the `Route` class that contains the routing details of a
 * specific application endpoint. It is assigned to a `Router` instance
 * via its `.register` method.
 *
 * @class
 */
export class Route {
  public components: any[] = [];

  public id: string;
  public path: string;
  public regExp: RegExp;
  public params: Parameter[];
  public policies: Policy[];

  public before?: () => Promise<any>;
  public after?: () => void;

  /**
   * Initializes a new `Route` instance.
   *
   * @param components - Components to output to application rendering engine.
   * @param options    - Routing options.
   */
  constructor(components: any | any[], options: Options) {
    this.components = Array.isArray(components) ? components : [components];

    this.id = options.id;
    this.path = options.path.replace(/\/$/, "");
    this.regExp = pathToRegexp(options.path);
    this.params = parseParams(options.path);
    this.policies = options.policies || [];

    this.before = options.before;
    this.after = options.after;
  }

  /**
   * Set base path for the route.
   *
   * @param path - Base path.
   *
   * @returns Route
   */
  public base(path: string = ""): this {
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
 | Helper Functions
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
   * Raw routing path, eg. /users/:slug
   */
  path: string;

  /**
   * Policies to run before executing the route.
   */
  policies?: Policy[];

  /**
   * Executes before the route is rendered.
   */
  before?(...args: any[]): Promise<any>;

  /**
   * Executes after the routed has been rendered.
   */
  after?(...args: any[]): void;
};
