import { Route } from "cmdo-socket";

import { wss } from "../Providers/WebSocketServer";
import { addEvents } from "../Services/Events/Actions/AddEvents";
import { getEvents } from "../Services/Events/Actions/GetEvents";

wss.register([Route.on("AddEvents", [addEvents]), Route.on("GetEvents", [getEvents])]);
