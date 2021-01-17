import { Container } from "cmdo-inverse";

import { BusToken } from "./Services/Bus";
import { RegistrarToken } from "./Services/Registrar";
import { StreamToken } from "./Services/Stream";

export const container = new Container<{
  Bus: BusToken;
  Registrar: RegistrarToken;
  Stream: StreamToken;
}>();
