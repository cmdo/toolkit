import { Constructor, ConstructorArgs } from "./Types/Constructor";
import { Tokens } from "./Types/Token";

/**
 * Inverse
 *
 * A simple dependency injection service using inversion of control principles
 * allowing the developer to program against TypeScript types or interfaces
 * with implementation details is injected by service providers.
 *
 * @author  Christoffer Rødvik <dev@kodemon.net>
 * @license MIT
 */
export class Container<T extends Tokens> {
  private transients: Map<keyof T, unknown> = new Map();
  private singletons: Map<keyof T, unknown> = new Map();

  /**
   * Register a transient or singleton provider against the provided token.
   *
   * @param token    - Token to register.
   * @param provider - Provider to register against the token.
   *
   * @returns Container
   */
  public set<K extends keyof T>(token: K, provider: Constructor<T[K]["type"]>): this;
  public set<K extends keyof T>(token: K, provider: T[K]["type"]): this;
  public set<K extends keyof T>(token: K, provider: Constructor<T[K]["type"]> | T[K]["type"]): this {
    if (typeof provider === "function") {
      this.transients.set(token, provider);
    } else {
      this.singletons.set(token, provider);
    }
    return this;
  }

  /**
   * Get a transient or singleton provider instance.
   *
   * @param token - Provider token to resolve.
   * @param args  - Arguments to pass to transient provider constructor.
   *
   * @returns instantiated provider
   */
  public get<K extends keyof T>(token: K, ...args: ConstructorArgs<T[K]["ctor"]>): T[K]["type"] {
    const singleton = this.singletons.get(token);
    if (singleton) {
      return singleton as T[K]["type"];
    }
    const transient = this.transients.get(token);
    if (transient) {
      return new (transient as Constructor<T>)(...args);
    }
    throw new Container.MissingDependencyError(token);
  }

  /*
   |--------------------------------------------------------------------------------
   | Errors
   |--------------------------------------------------------------------------------
   */

  public static MissingDependencyError = class extends Error {
    public type = "MissingDependencyError" as const;

    constructor(token: string | number | symbol) {
      super();
      this.message = `Attempted to resolve unregistered dependency token: "${token.toString()}"`;
    }
  };
}
