import { Constructor, ConstructorArgs } from "../Types/Constructor";
import { Tokens } from "../Types/Token";
import { Provider } from "./Provider";

/**
 * Inverse
 *
 * A simple dependency injection service using inversion of control principles
 * allowing the developer to program against TypeScript types or interfaces
 * with implementation details is injected by consumer services.
 *
 * @author   Christoffer Rødvik <dev@kodemon.net>
 * @license  MIT
 */
export class Container<T extends Tokens> {
  private transients: Map<keyof T, Provider> = new Map();
  private singletons: Map<keyof T, unknown> = new Map();

  /**
   * Bind type of interface to implementation module.
   *
   * @param token    - Token to bind module to.
   * @param provider - Provider to register against the type.
   */
  public register<K extends keyof T>(token: K, provider: Constructor<T[K]["type"]>): this {
    this.transients.set(token, new Provider(provider));
    return this;
  }

  /**
   * Register a resolved singleton instance with the container.
   *
   * @param token    - Token to bind singleton to.
   * @param provider - Singleton instance to register.
   */
  public singleton<K extends keyof T>(token: K, provider: T[K]["type"]): this {
    this.singletons.set(token, provider);
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
  public resolve<K extends keyof T>(token: K, ...args: ConstructorArgs<T[K]["ctor"]>): T[K]["type"] {
    const singleton = this.singletons.get(token);
    if (singleton) {
      return singleton as T[K]["type"];
    }
    const transient = this.transients.get(token);
    if (transient) {
      return transient.make(...args);
    }
    throw new Error(`Cannot resolve ${token}, make sure to inject dependencies before they are used.`);
  }
}
