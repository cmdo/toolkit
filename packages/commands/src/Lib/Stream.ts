import { container } from "../Container";
import { Aggregate } from "../Types";
import { Event } from "./Event";

export class Stream<A extends Aggregate = any> {
  /**
   * Create a new Stream instance.
   *
   * @param id     - Stream id.
   * @param stream - Event stream service.
   */
  constructor(public id: string, private stream = container.get("Stream")) {
    this.get = this.get.bind(this);
    this.state = this.state.bind(this);
    this.apply = this.apply.bind(this);
  }

  /**
   * Retrieve list of events in the stream.
   *
   * @returns Events
   */
  public async get<T extends Event>(): Promise<T[]> {
    return this.stream.get(this.id);
  }

  /**
   * Retrieve state from current events in the stream.
   *
   * @param isGenesis - Should we check if a stream already exists?
   *
   * @returns State
   */
  public async state(isGenesis = false): Promise<A> {
    const events = await this.get();

    // ### Genesis Check
    // On genesis state retrieval we need to ensure that the requested stream
    // does not already exist.

    if (isGenesis) {
      if (events.length) {
        throw new Stream.DuplicateError(this.id);
      }
      return { id: this.id } as A;
    }

    // ### Event Folding
    // Fold the event stream into a single current state object.

    if (!events.length) {
      throw new Stream.NotFoundError(this.id);
    }

    let state: any = { id: this.id };
    for (const event of events) {
      state = event.fold(state);
    }
    return state as A;
  }

  /**
   * Apply the provided event to the stream.
   *
   * @param event - Event to apply to the stream.
   */
  public async apply<T extends Event>(event: T): Promise<void> {
    await this.stream.add(this.id, event);
  }

  /**
   * Creates error for genesis stream that already exists.
   */
  private static DuplicateError = class extends Error {
    public type = "DuplicateError" as const;

    constructor(stream: string) {
      super();
      this.message = `Stream ${stream} already exists.`;
    }
  };

  /**
   * Creates error for a non genesis stream that could not be resolved.
   */
  private static NotFoundError = class extends Error {
    public type = "NotFoundError" as const;

    constructor(stream: string) {
      super();
      this.message = `Stream ${stream} does not exist.`;
    }
  };
}
