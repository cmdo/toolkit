import { Token } from "cmdo-inverse";

import { Event } from "../Lib/Event";

export type StreamService = {
  /**
   * Add event to a persistent data store.
   *
   * @param id    - Stream id to persist the event under.
   * @param event - Event to persist.
   */
  add(id: string, event: Event): Promise<void>;

  /**
   * Get all events in order of creation for the provided event stream.
   *
   * @param id - Stream id.
   *
   * @returns Events
   */
  get<T extends Event>(id: string): Promise<T[]>;
};

export type StreamToken = Token<{ new (): StreamService }, StreamService>;
