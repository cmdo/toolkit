import { AccessControl } from "cmdo-access";
import { HttpError } from "cmdo-http";

import { container } from "../Container";
import { Context, Options, Request } from "../Types";
import * as policyResponse from "./Policy";
import { Stream } from "./Stream";
import { verifyData } from "./Utils";

const DEFAULT_CONTEXT = { auditor: "guest", access: new AccessControl("guest", {}) };

export class Command {
  private reserved: string[] = [];

  /**
   * Create a new Command instance.
   *
   * @param type - Command type to resolve.
   */
  constructor(private options: Options, public bus = container.get("Bus"), public registrar = container.get("Registrar")) {}

  /**
   * Genesis state of the command.
   *
   * @returns Genesis state
   */
  public get genesis(): boolean {
    return this.options.genesis === true;
  }

  /**
   * Resolve the command with the given stream id.
   *
   * @param req - Command request.
   * @param ctx - Request context.
   */
  public async resolve(req: Request, ctx: Context = DEFAULT_CONTEXT): Promise<void> {
    const { handler } = this.options;
    try {
      await this.bus.reserve(req.stream);

      const data = this.options.data;
      if (data) {
        verifyData(req.data, data);
      }

      await this.policies(req, ctx);
      await this.reserve(req);

      const stream = new Stream(req.stream);
      const state = await stream.state(this.genesis);

      await handler.call(
        {
          ...state,
          registrar: this.registrar,
          apply: stream.apply
        },
        req,
        ctx
      );
    } catch (err) {
      this.release(req);
      throw err;
    } finally {
      this.bus.release(req.stream);
    }
  }

  /**
   * Validate command policies.
   *
   * @param req - Command request.
   * @param ctx - Request context.
   */
  private async policies(req: Request, ctx: Context): Promise<HttpError | void> {
    const { policies = [] } = this.options;
    for (const policy of policies) {
      const response = await policy.call(policyResponse, req, ctx);
      switch (response.status) {
        case "accepted": {
          continue; // policy accepted, check next policy ...
        }
        case "rejected": {
          return new HttpError(response.code, response.message, response.data);
        }
      }
    }
  }

  /**
   * Registrar command reservation.
   *
   * @remarks
   * A command can attempt to reserve incoming key => value pairs as unique entries.
   *
   * @param req - Command request.
   */
  private async reserve(req: Request): Promise<void> {
    const { reserve = [] } = this.options;
    for (const key of reserve) {
      const value: string | undefined = (req.data as any)[key];
      if (!value) {
        throw new HttpError(400, "Missing required reservation key in data object.", { key });
      }
      await this.registrar.register(key, value);
      this.reserved.push(key);
    }
  }

  /**
   * Release command reservations.
   *
   * @param req - Command request.
   */
  private release(req: Request) {
    for (const key of this.reserved) {
      this.registrar.release(key, req.data[key]);
    }
  }
}
