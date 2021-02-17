import { Token } from "cmdo-inverse";

import { Event } from "../Lib/Event";

export type StreamService = {
  /**
   * Add event to a persistent data store.
   *
   * @param streamId - Stream id to persist the event under.
   * @param event    - Event to persist.
   */
  add(streamId: string, event: Event): Promise<void>;

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
