import { Constructor } from "../Types/Constructor";

/**
 * Provider class facilitating transient providers.
 *
 * @class
 */
export class Provider<T = any> {
  /**
   * Creates a new Module instance.
   *
   * @param provider - Provider being instantiated on make.
   */
  constructor(private provider: Constructor<T>) {}

  /**
   * Instantiate and return the instantiation of the module provider.
   *
   * @param args - Arguments to pass to the provider constructor.
   *
   * @returns Provider instance
   */
  public make(...args: any[]): T {
    return new this.provider(...args);
  }
}
