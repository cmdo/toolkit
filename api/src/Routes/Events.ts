import { Route } from "cmdo-socket";

import { wss } from "../Providers/WebSocketServer";
import { syncEvents } from "../Services/Events/Actions/SyncEvents";

wss.register([Route.on("SyncEvents", [syncEvents])]);
