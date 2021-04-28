import { container } from "../Container";
import { clock } from "./Clock";

export function getId(origin = container.get("EventOrigin")): string {
  const ts = clock.now().toJSON();
  return `${ts.time}-${ts.logical}@${origin}`;
}
