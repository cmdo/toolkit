import { Event } from "cmdo-events";

export class UserEmailSet extends Event<{
  id: string;
  email: string;
}> {
  public readonly type = "UserEmailSet" as const;
}
