import type { HttpStatus } from "../Types";
import type { RedirectType } from "./Policy";

/*
 |--------------------------------------------------------------------------------
 | Response
 |--------------------------------------------------------------------------------
 */

abstract class HttpResponse {
  public status: HttpStatus;

  constructor(status: HttpStatus) {
    this.status = status;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Success
 |--------------------------------------------------------------------------------
 */

export class HttpSuccess extends HttpResponse {
  public readonly status = "success" as const;

  public data?: any;

  /**
   * Create a new HttpSuccess instance.
   *
   * @param data - (Optional) Data provided with the success response. Default: {}
   */
  constructor(data = {}) {
    super("success");
    this.data = data;
  }

  /**
   * Retrieve the HTTP/S code for the response type.
   *
   * @returns HTTP/S 2xx
   */
  public code(): number {
    if (this.data !== undefined) {
      return 200;
    }
    return 204;
  }
}

/*
 |--------------------------------------------------------------------------------
 | Redirect
 |--------------------------------------------------------------------------------
 */

export class HttpRedirect extends HttpResponse {
  public readonly status = "redirect" as const;

  public type: RedirectType;
  public url: string;

  /**
   * Create a new HttpRedirect instance.
   *
   * @param url  - Url to redirect the request to.
   * @param type - (Optional) Type of redirect. Default: PERMANENT
   */
  constructor(url: string, type: RedirectType = "PERMANENT") {
    super("redirect");
    this.type = type;
    this.url = url;
  }

  /**
   * Retrieve the HTTP/S code for the redirect type.
   *
   * @returns HTTP/S 3xx
   */
  public code(): number {
    switch (this.type) {
      case "TEMPORARY": {
        return 307;
      }
      default: {
        return 301;
      }
    }
  }
}

/*
 |--------------------------------------------------------------------------------
 | Error
 |--------------------------------------------------------------------------------
 */

export class HttpError extends HttpResponse {
  public readonly status = "error" as const;

  public code: number; // HTTP/S 4xx
  public message: string;
  public details: any;

  /**
   * Create a new HttpError instance.
   *
   * @param code    - Error code.
   * @param message - Error message.
   * @param details - (Optional) Additional details.
   */
  constructor(code: number, message: string, details = {}) {
    super("error");
    this.code = code;
    this.message = message;
    this.details = details;
  }
}
