import type { BaseAttributes } from "cmdo-domain";
import { Event } from "cmdo-domain";

type Attributes = BaseAttributes & {
  aggregateId: string;
  name: string;
}

export class UserNameSet extends Event<Attributes> {
  public readonly type = "UserNameSet" as const;

  constructor(public readonly aggregateId: string, public readonly name: string) {
    super();
  }

  public toJSON() {
    return super.toJSON({
      aggregateId: this.aggregateId,
      name: this.name
    });
  }
}