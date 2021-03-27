import { Command } from "cmdo-domain";

export class SetSampleText extends Command {
  public readonly type = "SetSampleText" as const;

  constructor(id: string, public readonly text: string) {
    super(id);
  }
}
