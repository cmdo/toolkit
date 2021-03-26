import { AggregateClass, AggregateRoot } from "./AggregateRoot";
import { Command } from "./Command";
import { Repository } from "./Repository";

type CommandHandlersClass<T, A extends AggregateRoot> = {
  new (repository: Repository<A>): T;
};

export abstract class CommandHandlers<T extends AggregateRoot, R extends Repository<T> = Repository<T>> {
  constructor(public readonly repository: R) {}

  /**
   * Get a managed handle method that abstracts away the need to keep instantiating
   * the CommandHandlers class.
   *
   * @param aggregate - AggregateRoot class used for the repository instance.
   *
   * @example
   *
   *   class UserCommandHandlers extends CommandHandlers<User> {}
   *   const handle = UserCommandHandlers.handle(User);
   *   handle(new CreateUser("John Doe")).catch(console.log);
   *
   * @returns Handle function.
   */
  public static handle<C extends Command, A extends AggregateRoot, T extends CommandHandlers<A>>(
    this: CommandHandlersClass<T, A>,
    aggregate: AggregateClass<A>
  ): (command: C) => Promise<void> {
    let instance: T | undefined;
    return async (command: Command) => {
      if (!instance) {
        instance = new this(new Repository<A>(aggregate));
      }
      return instance.handle(command);
    };
  }

  /**
   * Handle new command request.
   *
   * @param command - Command to handle.
   *
   * @example
   *
   *   type Command = CreateUser | UpdateUserEmail;
   *
   *   class UserCommandHandlers extends CommandHandlers<AggregateRoot> {
   *     public async handle(command: Command): Promise<void> {
   *       switch (command.type) {
   *         case "CreateUser": {
   *           const user = new User(command.entityId);
   *           user.create(command.name, command.email);
   *           await this.repository.save(user);
   *         }
   *         case "UpdateUserEmail": {
   *           const user = await this.repository.getById(command.entityId);
   *           user.changeEmail(command.email);
   *           await this.repository.save(user);
   *         }
   *       }
   *     }
   *   }
   */
  public abstract handle(command: Command): Promise<void>;

  /*
   |--------------------------------------------------------------------------------
   | Errors
   |--------------------------------------------------------------------------------
   */

  protected static HandlerNotFoundError = class extends Error {
    public readonly type = "HandlerNotFoundError" as const;

    constructor(type: string) {
      super(`CommandHandlers Violation: No handler registered for '${type}'.`);
    }
  };
}
