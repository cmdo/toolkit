import { Route, router } from "cmdo-http";

import { addEvent } from "../Services/Streams/Actions/AddEvent";
import { syncEvents } from "../Services/Streams/Actions/SyncEvents";

router.register([Route.post("/streams/:stream/events", [addEvent]), Route.post("/streams/:stream/sync", [syncEvents])]);
