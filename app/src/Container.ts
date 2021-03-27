import { Container } from "cmdo-inverse";

import type { TenantStoreToken } from "./Services/TenantStore";

export const container = new Container<{
  TenantStore: TenantStoreToken;
}>();
