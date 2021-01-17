/**
 * Error class specific to `Router`.
 *
 * @class
 */
export class RouterError extends Error {
  public details: any;

  /**
   * Initializes a new `RouterError` instance.
   *
   * @param message - Error message.
   * @param details - (Optional) Error details object.
   */
  constructor(message: string, details: any = {}) {
    super(message);
    this.name = "RouterError";
    this.details = details;
  }
}
