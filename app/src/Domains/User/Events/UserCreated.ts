import type { BaseAttributes } from "cmdo-domain";
import { Event } from "cmdo-domain";

type Attributes = BaseAttributes & {
  aggregateId: string;
  name: string;
  email: string;
};

export class UserCreated extends Event<Attributes> {
  public readonly type = "UserCreated" as const;

  constructor(public readonly aggregateId: string, public readonly name: string, public readonly email: string) {
    super();
  }

  public toJSON() {
    return super.toJSON({
      aggregateId: this.aggregateId,
      name: this.name,
      email: this.email
    });
  }
}
