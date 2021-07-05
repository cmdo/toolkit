import { Event } from "cmdo-events";

export class UserNameSet extends Event<{
  id: string;
  name: string;
}> {
  public readonly type = "UserNameSet" as const;
}
