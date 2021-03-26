import { Container } from "cmdo-inverse";

import { EventStoreToken } from "./Services/EventStore";

export const container = new Container<{
  EventStore: EventStoreToken;
}>();
