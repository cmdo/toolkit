import { Command } from "cmdo-domain";

export class SetUserName extends Command {
  public readonly type = "SetUserName" as const;

  constructor(id: string, public readonly name: string) {
    super(id);
    if (!name) {
      throw new Error("You must provide a name.");
    }
  }
}
