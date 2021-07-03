import { HttpError, Middleware } from "cmdo-http";
import { Action } from "cmdo-socket";
import { ServerResponse } from "http";

import { Auth } from "../Providers/Auth";

/*
 |--------------------------------------------------------------------------------
 | Module
 |--------------------------------------------------------------------------------
 */

//#region Module

declare module "cmdo-socket" {
  interface Client {
    auth: Auth;
  }
}

declare module "http" {
  interface IncomingMessage {
    auth: Auth;
  }
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Middleware
 |--------------------------------------------------------------------------------
 */

//#region Middleware

export const setWebSocketAuth: Action = async function (socket) {
  if (!socket.auth) {
    socket.auth = new Auth();
  }
  return this.accept();
};

export function auth(): Middleware {
  return async function (req, res) {
    if (req.headers.authorization) {
      try {
        req.auth = await Auth.resolve(req.headers.authorization);
      } catch (err) {
        sendUnauthorizedResponse(res, err);
      }
    } else {
      req.auth = new Auth();
    }
  };
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region Utilities

function sendUnauthorizedResponse(res: ServerResponse, error: Error): void {
  res.statusCode = 401;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(new HttpError(401, "Unauthorized", { error })));
  res.end();
}

//#endregion
