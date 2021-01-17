import { Token } from "cmdo-inverse";

export type BusService = {
  /**
   * Reserve a command request.
   *
   * @remarks
   * If a reservation is not successfully made the command request will
   * be reported as a server timeout.
   *
   * @param id - Reservation id.
   */
  reserve(id: string): Promise<void>;

  /**
   * Release a reserved command request.
   *
   * @param id - Reservation id.
   */
  release(id: string): Promise<void>;
};

export type BusToken = Token<{ new (): BusService }, BusService>;
