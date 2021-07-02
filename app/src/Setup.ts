import { setOrigin } from "cmdo-events";

import { socket } from "./Lib/Socket";
import { setStream } from "./Lib/Stream";
import { origin } from "./Providers/EventOrigin";

export async function setup() {
  setOrigin(origin);
  socket.connect();

  await Promise.all([import("./Subscribers/User")]);

  await setStream("toolkit");
}
