import { IncomingMessage, ServerResponse } from "http";

import { router } from "..";
import { HttpError, HttpRedirect, HttpSuccess } from "../Lib/Response";
import { Middleware } from "../Types";

/*
 |--------------------------------------------------------------------------------
 | Route
 |--------------------------------------------------------------------------------
 */

export function route(): Middleware {
  return async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const result = await router.resolve(req);
      switch (result.status) {
        case "success": {
          handleResponse(res, result);
          break;
        }
        case "redirect": {
          handleRedirect(res, result);
          break;
        }
        case "error": {
          handleError(res, result);
          break;
        }
      }
    } catch (error) {
      if (error instanceof HttpError) {
        handleResponse(res, error);
      } else {
        handleResponse(res, new HttpError(500, "Internal server error", error));
      }
    } finally {
      res.end();
    }
  };
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

/**
 * Handle redirect assignments.
 *
 * @param res    - Server response to write redirect for.
 * @param result - HttpRedirect instance.
 */
function handleRedirect(res: ServerResponse, result: HttpRedirect): void {
  res.writeHead(result.code, { location: result.url });
}

/**
 * Handle error assignments.
 *
 * @param res    - Server response to write error for.
 * @param result - HttpError instance.
 */
function handleError(res: ServerResponse, result: HttpError): void {
  if (result.code === 500) {
    console.log(result);
  }
  handleResponse(res, result);
}

/**
 * Handle routing response assignments.
 *
 * @param res    - Server response to write success for.
 * @param result - HttpSuccess or HttpError instance.
 */
function handleResponse(res: ServerResponse, result: HttpSuccess | HttpError): void {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = result.code;
  res.write(JSON.stringify(result.toJSON()));
}
