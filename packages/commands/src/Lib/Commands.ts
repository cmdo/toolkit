import { Options } from "../Types";
import { Command } from "./Command";

const map: Map<string, Options<any, any>> = new Map();

export const commands = {
  /**
   * Set a command.
   *
   * @param options - Command options.
   */
  set<Aggregate, Data>(options: Options<Aggregate, Data>): void {
    map.set(options.type, options);
  },

  /**
   * Retrieve command.
   *
   * @param type - Command type.
   *
   * @returns Command options or undefined
   */
  get(type: string): Command | undefined {
    const options = map.get(type);
    if (options) {
      return new Command(options);
    }
  }
};
