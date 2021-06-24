import { pathToRegexp } from "path-to-regexp";

import type { Action } from "./Action";
import type { Parameter } from "./Params";
import { parseParams } from "./Params";

export class Route {
  public path: string;
  public actions: Action[];

  public regExp: RegExp;
  public params: Parameter[];

  constructor(path: string, actions: Action[]) {
    this.path = path.replace(/\/$/, "");
    this.actions = actions;
    this.regExp = pathToRegexp(path);
    this.params = parseParams(path);
  }

  public base(path = ""): this {
    this.regExp = pathToRegexp(path + this.path);
    return this;
  }

  public match(path: string): any {
    return this.regExp.exec(path);
  }
}
