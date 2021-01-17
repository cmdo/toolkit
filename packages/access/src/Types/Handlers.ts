/**
 * Access handler storage format.
 */
export type AccessHandlers = {
  [resource: string]: {
    [action: string]: AccessHandler;
  };
};

/**
 * Access handler takes a list of grants along with a dynamic data object
 * and returns a query response.
 *
 * @param grant - Grant configuration to validate against.
 * @param data  - Data to validate.
 *
 * @returns query response
 */
export type AccessHandler<G = unknown, D = unknown> = (grant: G, data: D) => AccessResponse;

/**
 * Access response resulting from an executed query.
 */
export type AccessResponse = AccessGranted | AccessDenied;

type AccessGranted = {
  granted: true;
  attributes?: string[];
};

type AccessDenied = {
  granted: false;
  message?: string;
};
