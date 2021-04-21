import type { BaseAttributes } from "cmdo-events";
import { Event } from "cmdo-events";

type Attributes = BaseAttributes & {
  id: string;
  email: string;
};

export class UserEmailSet extends Event<Attributes> {
  public readonly type = "UserEmailSet" as const;

  constructor(public readonly id: string, public readonly email: string) {
    super();
  }

  public toJSON() {
    return super.toJSON({
      id: this.id,
      email: this.email
    });
  }
}
