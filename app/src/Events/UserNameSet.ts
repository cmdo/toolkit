import type { BaseAttributes } from "cmdo-events";
import { Event } from "cmdo-events";

type Attributes = BaseAttributes & {
  id: string;
  name: string;
};

export class UserNameSet extends Event<Attributes> {
  public readonly type = "UserNameSet" as const;

  constructor(public readonly id: string, public readonly name: string) {
    super();
  }

  public toJSON() {
    return super.toJSON({
      id: this.id,
      name: this.name
    });
  }
}
