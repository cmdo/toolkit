import { container } from "../Container";
import { Event } from "./Event";

export class Stream {
  /**
   * Create a new Stream instance.
   *
   * @param id     - Stream id.
   * @param stream - Event stream service.
   */
  constructor(public id: string, private stream = container.get("Stream")) {
    this.apply = this.apply.bind(this);
    this.get = this.get.bind(this);
  }

  /**
   * Apply the provided event to the stream.
   *
   * @param event - Event to apply to the stream.
   * @param args  - List of apply arguments.
   */
  public async apply<T extends Event>(event: T, ...args: unknown[]): Promise<void> {
    await this.stream.add(this.id, event, ...args);
  }

  /**
   * Retrieve list of events in the stream.
   *
   * @param args - List of stream arguments.
   *
   * @returns Events
   */
  public async get<T extends Event>(...args: unknown[]): Promise<T[]> {
    return this.stream.get(this.id, ...args);
  }
}
