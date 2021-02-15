import { Container } from "cmdo-inverse";

import { BusToken } from "./Services/Bus";
import { StreamToken } from "./Services/Stream";

export const container = new Container<{
  Bus: BusToken;
  Stream: StreamToken;
}>();
