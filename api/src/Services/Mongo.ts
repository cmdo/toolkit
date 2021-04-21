import { config } from "../Config";
import { Mongo } from "../Lib/Mongo";

export type EventDescriptor = {
  stream: string;
  event: any;
};

export const mongo = new Mongo(config.mongo.name, config.mongo.uri);
