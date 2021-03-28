import { Command } from "cmdo-domain";

export class SetUserEmail extends Command {
  public readonly type = "SetUserEmail" as const;

  constructor(id: string, public readonly email: string) {
    super(id);
    if (!email) {
      throw new Error("You must provide email.");
    }
  }
}
