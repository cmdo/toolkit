import { Container } from "cmdo-inverse";

import { StreamToken } from "./Services/Stream";

export const container = new Container<{ Stream: StreamToken }>();
