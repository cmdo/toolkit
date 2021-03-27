import { Event } from "cmdo-domain";

export class SampleCreated extends Event {
  public readonly type = "SampleCreated" as const;

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
