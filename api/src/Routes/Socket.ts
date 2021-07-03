import { Action, Route } from "cmdo-socket";

import { wss } from "../Providers/WebSocketServer";

/*
 |--------------------------------------------------------------------------------
 | Action
 |--------------------------------------------------------------------------------
 */

//#region Action

const join: Action<{ name: string }> = async function (socket, { name }) {
  socket.join(name);
  return this.respond();
};

const leave: Action<{ name: string }> = async function (socket, { name }) {
  socket.leave(name);
  return this.respond();
};

const chat: Action<{ room: string; message: string }> = async function (socket, { room, message }) {
  socket.to(room).emit("chat", { message });
  return this.respond();
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Register
 |--------------------------------------------------------------------------------
 */

//#region Register

wss.register([Route.on("join", [join]), Route.on("leave", [leave]), Route.on("chat", [chat])]);

//#endregion
