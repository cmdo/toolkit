import { Route } from "cmdo-socket";

import { wss } from "../Providers/WebSocketServer";
import { getLastKnownDeviceID } from "../Services/Events/Actions/GetLastKnownDeviceID";
import { syncEvents } from "../Services/Events/Actions/SyncEvents";

wss.register([Route.on("GetLastKnownDeviceID", [getLastKnownDeviceID]), Route.on("SyncEvents", [syncEvents])]);
