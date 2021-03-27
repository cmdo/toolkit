import { AggregateRoot } from "cmdo-domain";

import { SampleCreated } from "./Events/SampleCreated";
import { SampleTextSet } from "./Events/SampleTextSet";

type Event = SampleCreated | SampleTextSet;

export class Sample extends AggregateRoot<Event> {
  public readonly type = "Sample" as const;

  public text!: string;

  /*
   |--------------------------------------------------------------------------------
   | Commands
   |--------------------------------------------------------------------------------
   */

  public create(text: string): void {
    this.apply(new SampleCreated(this.id, text));
  }

  public setText(text: string): void {
    if (text === this.text) {
      throw new Error("Text has not changed, abort!");
    }
    this.apply(new SampleTextSet(this.id, text));
  }

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  public when(event: Event) {
    switch (event.type) {
      case "SampleCreated":
      case "SampleTextSet": {
        this.text = event.text;
        break;
      }
    }
  }
}
