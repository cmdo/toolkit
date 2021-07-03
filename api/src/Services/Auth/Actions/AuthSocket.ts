import { Action } from "cmdo-socket";

import { Auth } from "../../../Providers/Auth";

/*
 |--------------------------------------------------------------------------------
 | Action
 |--------------------------------------------------------------------------------
 */

//#region Action

export const setSocketAuthentication: Action<{ token: string }> = async function (socket, data) {
  try {
    socket.auth = await Auth.resolve(data.token);
  } catch (err) {
    return this.reject(err.message);
  }
  return this.respond();
};

//#endregion
