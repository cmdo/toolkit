import { Command } from "cmdo-domain";

import { nanoid } from "../../../Utils/NanoId";

export class CreateUser extends Command {
  public readonly type = "CreateUser" as const;

  constructor(public readonly name: string, public readonly email: string) {
    super(nanoid());
    if (!name) {
      throw new Error("You must provide a name.");
    }
    if (!email) {
      throw new Error("You must provide email.");
    }
  }
}
