import type { IncomingMessage } from "http";

/*
 |--------------------------------------------------------------------------------
 | Responses
 |--------------------------------------------------------------------------------
 */

/**
 * Generates a policy accept response.
 *
 * @returns Accept
 */
export function accept(): Accepted {
  return {
    status: "accepted"
  };
}

/**
 * Generates a policy redirect response.
 *
 * @param url  - Redirect url.
 * @param type - (Optional) Redirect type. Default: PERMANENT
 *
 * @returns Redirect
 */
export function redirect(url: string, type: RedirectType = "PERMANENT"): Redirect {
  return {
    status: "redirect",
    type,
    url
  };
}

/**
 * Generates a policy reject response.
 *
 * @param code    - Http response code.
 * @param message - Message detailing the rejection.
 * @param data    - (Optional) Additional rejection data.
 *
 * @returns Reject
 */
export function reject(code: number, message: string, data = {}): Rejected {
  return {
    status: "rejected",
    code,
    message,
    data
  };
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Policy = (this: Response, req: IncomingMessage) => Promise<Accepted | Redirect | Rejected>;

type Response = {
  accept(): Accepted;
  redirect(url: string, type?: RedirectType): Redirect;
  reject(code: number, message: string, data?: any): Rejected;
};

type Accepted = {
  status: "accepted";
};

type Redirect = {
  status: "redirect";
  type: RedirectType;
  url: string;
};

type Rejected = {
  status: "rejected";
  code: number;
  message: string;
  data: any;
};

export type RedirectType = "PERMANENT" | "TEMPORARY";
