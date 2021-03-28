import { AggregateRoot } from "cmdo-domain";

import { UserCreated } from "./Events/UserCreated";
import { UserEmailSet } from "./Events/UserEmailSet";
import { UserNameSet } from "./Events/UserNameSet";

type Event = UserCreated | UserNameSet | UserEmailSet;

export class User extends AggregateRoot<Event> {
  public readonly type = "User" as const;

  public name: string;
  public email: string;

  /*
   |--------------------------------------------------------------------------------
   | Commands
   |--------------------------------------------------------------------------------
   */

  public create(name: string, email: string): void {
    this.apply(new UserCreated(this.id, name, email));
  }

  public setName(name: string) {
    this.apply(new UserNameSet(this.id, name));
  }

  public setEmail(email: string) {
    this.apply(new UserEmailSet(this.id, email));
  }

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  public when(event: Event) {
    switch (event.type) {
      case "UserCreated": {
        this.name = event.name;
        this.email = event.email;
        break;
      }
      case "UserNameSet": {
        this.name = event.name;
        break;
      }
      case "UserEmailSet": {
        this.email = event.email;
        break;
      }
    }
  }
}
