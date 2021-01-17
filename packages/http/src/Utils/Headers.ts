import { ServerResponse } from "http";

/**
 * Apply a list of incoming headers to the server response.
 *
 * @param headers - List of headrs to apply.
 * @param res     - Server response object.
 */
export function applyHeaders(headers: any, res: ServerResponse): void {
  for (const header of headers) {
    if (header) {
      if (Array.isArray(header)) {
        applyHeaders(header, res);
      } else if (header.value) {
        res.setHeader(header.key, header.value);
      }
    }
  }
}
