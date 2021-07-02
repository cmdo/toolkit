let origin: string | undefined;

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region Utilities

/**
 * Set the event origin.
 *
 * @remarks
 *
 * This is attached to the logical ids generated for new events.
 *
 * @param value - Origin value.
 */
export function setOrigin(value: string | undefined): void {
  origin = value;
}

/**
 * Get the assigned origin value.
 *
 * @remarks
 *
 * Throws an error if no origin has been assigned.
 *
 * @returns
 */
export function getOrigin(): string {
  if (!origin) {
    throw new EventOriginError();
  }
  return origin;
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Errors
 |--------------------------------------------------------------------------------
 */

//#region Errors

class EventOriginError extends Error {
  public readonly type = "EventOriginError";

  constructor() {
    super("Event Origin Violation > Could not retrieve event origin value!");
  }
}

//#endregion
