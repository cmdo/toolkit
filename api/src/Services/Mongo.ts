import { config } from "../Config";
import { Mongo } from "../Lib/Mongo";

export const mongo = new Mongo(config.mongo.name, config.mongo.uri);
