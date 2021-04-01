import type { BaseAttributes } from "cmdo-domain";
import { Event } from "cmdo-domain";

type Attributes = BaseAttributes & {
  aggregateId: string;
  email: string;
};

export class UserEmailSet extends Event<Attributes> {
  public readonly type = "UserEmailSet" as const;

  constructor(public readonly aggregateId: string, public readonly email: string) {
    super();
  }

  public toJSON() {
    return super.toJSON({
      aggregateId: this.aggregateId,
      email: this.email
    });
  }
}
