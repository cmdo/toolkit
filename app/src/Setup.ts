import { socket } from "./Lib/Socket";
import { setTenant } from "./Lib/Tenant";

export async function setup() {
  socket.connect();

  await Promise.all([import("./Subscribers/User")]);

  await setTenant("toolkit");
}
