import { events } from "../Events";
import { saveDatabase } from "./Utils";

events.database.on("save", saveDatabase);
