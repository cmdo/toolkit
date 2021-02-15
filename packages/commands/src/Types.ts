import { AccessControl } from "cmdo-access";

import { Event } from "./Lib/Event";
import { Policy } from "./Lib/Policy";

/*
 |--------------------------------------------------------------------------------
 | General
 |--------------------------------------------------------------------------------
 */

export type Aggregate = {
  id: string;
};

/*
 |--------------------------------------------------------------------------------
 | Command
 |--------------------------------------------------------------------------------
 */

export type Options<State = unknown, Data = unknown> = {
  /**
   * Command type/name used as trigger identifier.
   */
  type: string;

  /**
   * Is this event the first in the event stream?
   */
  genesis?: boolean;

  /**
   * List of keys that are expected to exist on the incoming data object. This
   * ensures that the data expected exists when it is processed by the command
   * handler.
   */
  data?: string[];

  /**
   * List of command policies to execute before allowing access to the processing
   * of the command.
   */
  policies?: Policy[];

  /**
   * Command handler function.
   */
  handler: (this: State & Actions, req: Request<Data>, ctx: Context) => Promise<void>;
};

export type Request<Data = any> = {
  type: string;
  stream: string;
  data: Data;
};

export type Actions = {
  apply<T extends Event>(event: T): Promise<void>;
};

export type Context = {
  auditor: string;
  access: AccessControl;
};

/*
 |--------------------------------------------------------------------------------
 | Event
 |--------------------------------------------------------------------------------
 */

export type Meta = {
  [key: string]: any;

  /**
   * Creator of the event, if this is an impersonated event make sure to add
   * the impersonated entity id here. And the admin id to the impersonator
   * meta key of this event.
   */
  auditor: string;

  /**
   * UNIX timestamp of when the event was created. This value is also used for
   * sorting the event stream. Defaults to the time of creation if not manually
   * provided.
   */
  timestamp: string;

  /**
   * Check if the event stream is deleted.
   */
  deleted?: false | "deleted" | "destroyed";
};
