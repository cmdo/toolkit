import type { BaseAttributes } from "cmdo-events";
import { Event } from "cmdo-events";

type Attributes = BaseAttributes & {
  id: string;
  name: string;
  email: string;
};

export class UserCreated extends Event<Attributes> {
  public readonly type = "UserCreated" as const;

  constructor(public readonly id: string, public readonly name: string, public readonly email: string) {
    super();
  }

  public toJSON() {
    return super.toJSON({
      id: this.id,
      name: this.name,
      email: this.email
    });
  }
}
