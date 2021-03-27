import { CommandHandlers } from "cmdo-domain";

import type { CreateSample } from "./Commands/CreateSample";
import type { SetSampleText } from "./Commands/SetSampleText";
import { Sample } from "./Sample";

type Command = CreateSample | SetSampleText;

class SampleCommandHandlers extends CommandHandlers<Sample> {
  public async handle(command: Command) {
    let sample: Sample;
    switch (command.type) {
      case "CreateSample": {
        sample = new Sample(command.id);
        sample.create(command.text);
        break;
      }
      case "SetSampleText": {
        sample = await this.repository.getById(command.id);
        sample.setText(command.text);
        break;
      }
      default: {
        throw new CommandHandlers.HandlerNotFoundError((command as any).type);
      }
    }
    await this.repository.save(sample);
  }
}

export const handle = SampleCommandHandlers.handle(Sample);
