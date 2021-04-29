import { Container } from "cmdo-inverse";

import { EventOrigin } from "./Types/EventOrigin";

export const container = new Container<{
  EventOrigin: EventOrigin;
}>();
