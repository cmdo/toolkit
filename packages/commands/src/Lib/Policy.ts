import { Context, Request } from "../Types";

/*
 |--------------------------------------------------------------------------------
 | Responses
 |--------------------------------------------------------------------------------
 */

/**
 * Generates a policy accept response.
 *
 * @returns Accept response.
 */
export function accept(): Accepted {
  return {
    status: "accepted"
  };
}

/**
 * Generates a policy reject response.
 *
 * @param message - Message detailing the rejection.
 * @param data    - (Optional) Additional rejection data.
 *
 * @returns Reject response.
 */
export function reject(message: string, data = {}): Rejected {
  return {
    status: "rejected",
    message,
    data
  };
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type Policy = (this: Response, req: Request, ctx: Context) => Promise<Accepted | Rejected>;

type Response = {
  accept(): Accepted;
  reject(message: string, data?: any): Rejected;
};

type Accepted = {
  status: "accepted";
};

type Rejected = {
  status: "rejected";
  message: string;
  data: any;
};
