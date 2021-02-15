import { AccessControl } from "cmdo-access";

import { container } from "../Container";
import { Context, Options, Request } from "../Types";
import * as policyResponse from "./Policy";
import { Stream } from "./Stream";
import { verifyData } from "./Utils";

const DEFAULT_CONTEXT = { auditor: "guest", access: new AccessControl("guest", {}) };

export class Command {
  /**
   * Create a new Command instance.
   *
   * @param type - Command type to resolve.
   */
  constructor(private options: Options, public bus = container.get("Bus")) {}

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

      const stream = new Stream(req.stream);
      const state = await stream.state(this.genesis);

      await handler.call(
        {
          ...state,
          apply: stream.apply
        },
        req,
        ctx
      );
    } catch (err) {
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
  private async policies(req: Request, ctx: Context): Promise<void> {
    const { policies = [] } = this.options;
    for (const policy of policies) {
      const response = await policy.call(policyResponse, req, ctx);
      switch (response.status) {
        case "accepted": {
          continue; // policy accepted, check next policy ...
        }
        case "rejected": {
          throw new Command.PolicyError(response.message, response.data);
        }
      }
    }
  }

  /**
   * Creates error for a failed policy operation.
   */
  private static PolicyError = class extends Error {
    public type = "PolicyError" as const;

    public data: any;

    constructor(message: string, data: any) {
      super(message);
      this.data = data;
    }
  };
}
