import { jsonCopy } from "../Utils/JsonCopy";
import { hash } from "../Utils/Merkle";
import { Event } from "./Event";

export class EventDescriptor {
  public readonly id: string;
  public readonly event: Event;
  public readonly hash: string;
  public readonly version: string;

  constructor(id: string, event: Event, version: number) {
    this.id = id;
    this.event = event;
    this.hash = this.getHash();
    this.version = `${id}-${version}`;
  }

  public getHash() {
    return hash({
      id: this.id,
      event: this.getEventData(this.event),
      oid: this.event.meta.oid,
      version: this.version
    });
  }

  public getEventData(event: Event) {
    const copy = JSON.parse(JSON.stringify(event));
    return {
      ...copy.event,
      meta: {
        oid: copy.meta.oid
      }
    };
  }

  public toJSON() {
    return jsonCopy({
      id: this.id,
      event: this.event.toJSON(),
      hash: this.hash,
      version: this.version
    });
  }
}
