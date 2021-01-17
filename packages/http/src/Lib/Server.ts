import * as http from "http";

import { Middleware } from "../Types";

/**
 * Retrieve a new http server instance.
 *
 * @returns Http server instance
 */
export function server(middleware: Middleware[] = []): http.Server {
  return http.createServer(async function (req, res) {
    for (const handle of middleware) {
      if (res.headersSent) {
        return; // request has been ended ...
      }
      await handle(req, res);
    }

    // ### Sent Check
    // Make sure the request is properly ended.

    if (!res.headersSent) {
      return res.end();
    }
  });
}
