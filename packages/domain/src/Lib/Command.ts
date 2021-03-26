import { nanoid } from "../Utils/NanoId";

export abstract class Command {
  public abstract readonly type: string;

  constructor(public readonly id: string = nanoid()) {}

  /*
   |--------------------------------------------------------------------------------
   | Errors
   |--------------------------------------------------------------------------------
   */

  protected static ValidationError = class extends Error {
    public readonly type = "ValidationError" as const;

    public readonly name: string;
    public readonly details: string;

    constructor(name: string, details: string) {
      super("Command Violation: Provided data is not valid.");
      this.name = name;
      this.details = details;
    }
  };
}
