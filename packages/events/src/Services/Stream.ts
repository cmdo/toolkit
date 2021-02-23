import { Token } from "cmdo-inverse";

import { Event } from "../Lib/Event";

export type StreamService = {
  /**
   * Add event to a persistent data store.
   *
   * @remarks
   * A sourced event is an event that is provided from a different persistence
   * source. As such we may want to alter the behavior of the add method, such as
   * not pass the event back to the persistence source if it already exists.
   *
   * @param streamId - Stream id to persist the event under.
   * @param event    - Event to persist.
   * @param args     - Provider arguments.
   */
  add(streamId: string, event: Event, ...args: unknown[]): Promise<void>;

  /**
   * Get all events in order of creation for the provided event stream.
   *
   * @param streamId - Stream id.
   * @param args     - Provider arguments.
   *
   * @returns Events
   */
  get<T extends Event>(streamId: string, ...args: unknown[]): Promise<T[]>;
};

export type StreamToken = Token<{ new (): StreamService }, StreamService>;
