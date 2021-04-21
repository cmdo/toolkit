import { Notation } from "notation";

import { AccessResponse } from "../Types";

export const PERMISSION_DENIED_MESSAGE = "Pemission denied";

export class AccessPermission {
  public readonly granted: boolean;
  public readonly attributes: string[] = ["*"];
  public readonly message: string = PERMISSION_DENIED_MESSAGE;

  private readonly notate = Notation.create;

  /**
   * Create a new AccessPermission instance.
   *
   * @param response - Access response details.
   */
  constructor(response: AccessResponse) {
    this.granted = response.granted === true;
    if (response.granted === true && response.attributes) {
      this.attributes = response.attributes;
    }
    if (response.granted === false && response.message) {
      this.message = response.message;
    }
  }

  /**
   * Filter the given data object (or array of objects) by the permission
   * attributes, and returns this data with allowed attributes.
   *
   * @param data - Data to filter.
   *
   * @returns Filtered data.
   */
  public filter<T = unknown>(data: T): T;
  public filter<T = unknown>(data: T[]): T[];
  public filter<T = unknown>(data: T | T[]): T | T[] {
    if (!Array.isArray(data)) {
      return this.notate(data).filter(this.attributes).value;
    }
    return data.map((o) => this.notate(o).filter(this.attributes).value);
  }
}
