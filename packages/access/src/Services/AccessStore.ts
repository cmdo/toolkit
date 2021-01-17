import { Token } from "cmdo-inverse";

import { AccessGrantOperation, AccessGrantsData } from "../Types";

export type AccessStore = {
  /**
   * Set access grants for given access control id.
   *
   * @param id         - Storage id.
   * @param acid       - Access control id.
   * @param operations - List of grant operations to perform.
   */
  setGrants(id: string, acid: string, operations: AccessGrantOperation[]): Promise<void>;

  /**
   * Get access control instance for given access control id.
   *
   * @param id - Storage id.
   *
   * @returns access grant data
   */
  getGrants(id: string): Promise<AccessGrantsData>;
};

export type AccessStoreToken = Token<{ new (): AccessStore }, AccessStore>;
