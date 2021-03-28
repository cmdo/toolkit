import { CommandHandlers } from "cmdo-domain";

import type { CreateUser } from "./Commands/CreateUser";
import type { SetUserEmail } from "./Commands/SetUserEmail";
import type { SetUserName } from "./Commands/SetUserName";
import { User } from "./User";

type Command = CreateUser | SetUserName | SetUserEmail;

class SampleCommandHandlers extends CommandHandlers<User> {
  public async handle(command: Command) {
    let user: User;
    switch (command.type) {
      case "CreateUser": {
        user = new User(command.id);
        user.create(command.name, command.email);
        break;
      }
      case "SetUserName": {
        user = await this.repository.getById(command.id);
        user.setName(command.name);
        break;
      }
      case "SetUserEmail": {
        user = await this.repository.getById(command.id);
        user.setEmail(command.email);
        break;
      }
      default: {
        throw new CommandHandlers.HandlerNotFoundError((command as any).type);
      }
    }
    await this.repository.save(user);
  }
}

export const handle = SampleCommandHandlers.handle(User);
