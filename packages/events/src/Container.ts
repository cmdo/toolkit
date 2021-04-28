import { Container } from "cmdo-inverse";

import { EventOriginService } from "./Services/EventOrigin";

export const container = new Container<{
  EventOrigin: EventOriginService;
}>();
