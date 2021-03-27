import { Command } from "cmdo-domain";

export class CreateSample extends Command {
  public readonly type = "CreateSample" as const;

  constructor(public readonly text: string) {
    super();
    if (text.length < 10) {
      throw new Command.ValidationError("text", "Surely you can write more than 10 characters?");
    }
  }
}
