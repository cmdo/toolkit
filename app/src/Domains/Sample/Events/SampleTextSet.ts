import { Event } from "cmdo-domain";

export class SampleTextSet extends Event {
  public readonly type = "SampleTextSet" as const;

  constructor(public readonly id: string, public readonly text: string) {
    super();
  }

  public toJSON() {
    return super.toJSON({
      id: this.id,
      text: this.text
    });
  }
}
