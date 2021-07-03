import { Server } from "cmdo-socket";

import { setWebSocketAuth } from "../Middleware/Auth";

export const wss = new Server({}, [setWebSocketAuth]);
