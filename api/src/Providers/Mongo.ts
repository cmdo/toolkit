import { Descriptor } from "../../../packages/events/dist/cjs";
import { config } from "../Config";
import { Mongo } from "../Lib/Mongo";

export type EventDescriptor = {
  tenant: string;
  event: Descriptor;
};

export const mongo = new Mongo(config.mongo.name, config.mongo.uri);
