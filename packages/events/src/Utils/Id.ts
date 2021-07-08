import { clock } from "./Clock";

/**
 * Generate a unique logical timestamp id.
 *
 * @param origin - Origin to attach to the generated id.
 *
 * @returns Logical timestamp id
 */
export function getLogicalId(): string {
  const ts = clock.now().toJSON();
  return `${ts.time}-${String(ts.logical).padStart(5, "0")}`;
}
