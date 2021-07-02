import { getOrigin } from "../Providers/Origin";
import { clock } from "./Clock";

/**
 * Generate a unique logical timestamp id.
 *
 * @param origin - Origin to attach to the generated id.
 *
 * @returns Logical timestamp id
 */
export function getId(origin = getOrigin()): string {
  const ts = clock.now().toJSON();
  return `${ts.time}-${ts.logical}@${origin}`;
}
