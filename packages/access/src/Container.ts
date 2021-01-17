import { Container } from "cmdo-inverse";

import { AccessStoreToken } from "./Services/AccessStore";

export const container = new Container<{
  AccessStore: AccessStoreToken;
}>();
