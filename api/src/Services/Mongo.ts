import { config } from "../Config";
import { Mongo } from "../Lib/Mongo";

export type EventDescriptor = {
  tenant: string;
  event: any;
  version: string;
};

export const mongo = new Mongo(config.mongo.name, config.mongo.uri);
