import { container } from "../Container";
import { Event } from "./Event";

export class Stream<Args = unknown> {
  /**
   * Create a new Stream instance.
   *
   * @param id     - Stream id.
   * @param stream - Event stream service.
   */
  constructor(public id: string, private stream = container.get("Stream")) {
    this.get = this.get.bind(this);
    this.apply = this.apply.bind(this);
  }

  /**
   * Retrieve list of events in the stream.
   *
   * @param args - List of stream arguments.
   *
   * @returns Events
   */
  public async get<T extends Event>(...args: Args[]): Promise<T[]> {
    return this.stream.get(this.id, ...args);
  }

  /**
   * Apply the provided event to the stream.
   *
   * @param event - Event to apply to the stream.
   */
  public async apply<T extends Event>(event: T): Promise<void> {
    await this.stream.add(this.id, event);
  }
}
