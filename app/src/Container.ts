import { Container } from "cmdo-inverse";

import type { TenantToken } from "./Services/Tenant";

export const container = new Container<{
  Tenant: TenantToken;
}>();
