/*
  
  Cross-origin Resource Sharing 
  
  This implementation is copied from https://github.com/expressjs/cors and modified
  for use with the cmdo-http middleware.

 */

import { IncomingMessage, ServerResponse } from "http";

import { Middleware } from "../Types";
import { applyHeaders } from "../Utils/Headers";

/*
 |--------------------------------------------------------------------------------
 | Cors
 |--------------------------------------------------------------------------------
 */

export function cors(options: Options = defaultOptions()): Middleware {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const headers = [];
    const method = req.method && req.method.toUpperCase && req.method.toUpperCase();

    if (method === "OPTIONS") {
      // preflight
      headers.push(configureOrigin(options, req));
      headers.push(configureCredentials(options));
      headers.push(configureMethods(options));
      headers.push(configureAllowedHeaders(options, req));
      headers.push(configureMaxAge(options));
      headers.push(configureExposedHeaders(options));

      applyHeaders(headers, res);

      res.statusCode = options.optionsSuccessStatus;
      res.setHeader("Content-Length", "0");
      res.end();
    } else {
      // actual response
      headers.push(configureOrigin(options, req));
      headers.push(configureCredentials(options));
      headers.push(configureExposedHeaders(options));

      applyHeaders(headers, res);
    }
  };
}

/*
 |--------------------------------------------------------------------------------
 | Configurations
 |--------------------------------------------------------------------------------
 */

function configureOrigin(options: any, req: IncomingMessage) {
  var requestOrigin = req.headers.origin,
    headers = [],
    isAllowed;

  if (!options.origin || options.origin === "*") {
    // allow any origin
    headers.push([
      {
        key: "Access-Control-Allow-Origin",
        value: "*"
      }
    ]);
  } else if (typeof options.origin === "string") {
    // fixed origin
    headers.push([
      {
        key: "Access-Control-Allow-Origin",
        value: options.origin
      }
    ]);
    headers.push([
      {
        key: "Vary",
        value: "Origin"
      }
    ]);
  } else {
    isAllowed = isOriginAllowed(requestOrigin, options.origin);
    // reflect origin
    headers.push([
      {
        key: "Access-Control-Allow-Origin",
        value: isAllowed ? requestOrigin : false
      }
    ]);
    headers.push([
      {
        key: "Vary",
        value: "Origin"
      }
    ]);
  }

  return headers;
}

function configureCredentials(options: any) {
  if (options.credentials === true) {
    return {
      key: "Access-Control-Allow-Credentials",
      value: "true"
    };
  }
  return null;
}

function configureMethods(options: any) {
  var methods = options.methods;
  if (methods.join) {
    methods = options.methods.join(","); // .methods is an array, so turn it into a string
  }
  return {
    key: "Access-Control-Allow-Methods",
    value: methods
  };
}

function configureAllowedHeaders(options: any, req: IncomingMessage) {
  var allowedHeaders = options.allowedHeaders || options.headers;
  var headers = [];

  if (!allowedHeaders) {
    allowedHeaders = req.headers["access-control-request-headers"]; // .headers wasn't specified, so reflect the request headers
    headers.push([
      {
        key: "Vary",
        value: "Access-Control-Request-Headers"
      }
    ]);
  } else if (allowedHeaders.join) {
    allowedHeaders = allowedHeaders.join(","); // .headers is an array, so turn it into a string
  }

  if (allowedHeaders && allowedHeaders.length) {
    headers.push([
      {
        key: "Access-Control-Allow-Headers",
        value: allowedHeaders
      }
    ]);
  }

  return headers;
}

function configureMaxAge(options: any) {
  var maxAge = (typeof options.maxAge === "number" || options.maxAge) && options.maxAge.toString();
  if (maxAge && maxAge.length) {
    return {
      key: "Access-Control-Max-Age",
      value: maxAge
    };
  }
  return null;
}

function configureExposedHeaders(options: any) {
  var headers = options.exposedHeaders;

  if (!headers) {
    return null;
  } else if (headers.join) {
    headers = headers.join(","); // .headers is an array, so turn it into a string
  }

  if (headers && headers.length) {
    return {
      key: "Access-Control-Expose-Headers",
      value: headers
    };
  }

  return null;
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

/**
 * Retreieve default cors options.
 *
 * @returns Options
 */
function defaultOptions(): Options {
  return {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204
  };
}

/**
 * Check if the provided origin is in the list of allowed origins.
 *
 * @param origin        - Incoming origin.
 * @param allowedOrigin - Allowed origins.
 *
 * @returns Boolean
 */
function isOriginAllowed(origin: any, allowedOrigin: any): boolean {
  if (Array.isArray(allowedOrigin)) {
    for (var i = 0; i < allowedOrigin.length; ++i) {
      if (isOriginAllowed(origin, allowedOrigin[i])) {
        return true;
      }
    }
    return false;
  } else if (typeof allowedOrigin === "string") {
    return origin === allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  }
  return !!allowedOrigin;
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type Options = {
  origin: string;
  methods: string;
  optionsSuccessStatus: number;
};
