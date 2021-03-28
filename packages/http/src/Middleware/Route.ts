import { IncomingMessage, ServerResponse } from "http";

import { router } from "..";
import { HttpError, HttpRedirect, HttpSuccess } from "../Lib/Response";
import { Middleware } from "../Types";
import { applyHeaders } from "../Utils/Headers";

const headers = [{ key: "Content-Type", value: "application/json" }];

export function route(): Middleware {
  return async (req: IncomingMessage, res: ServerResponse) => {
    let response: HttpSuccess | HttpRedirect | HttpError;

    // ### Headers
    // Apply the default response headers.

    applyHeaders(headers, res);

    // ### Resolve Request

    try {
      response = await router.resolve(req);
      switch (response.status) {
        case "success": {
          res.statusCode = response.code();
          break;
        }
        case "redirect": {
          res.statusCode = response.code();
          break;
        }
        case "error": {
          res.statusCode = response.code;
          break;
        }
      }
    } catch (error) {
      if (error instanceof HttpError) {
        res.statusCode = error.code;
        response = error;
      } else {
        res.statusCode = 500;
        response = new HttpError(500, "Internal server error", error);
      }
    }

    // ### Error
    // Console log internal server errors.

    if (res.statusCode === 500) {
      console.error(response);
    }

    // ### Respond
    // Write to the response and end the request.

    res.write(JSON.stringify(response));
    res.end();
  };
}
