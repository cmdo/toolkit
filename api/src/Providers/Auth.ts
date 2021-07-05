import jwt from "jsonwebtoken";

import { AccessControl } from "../../../packages/access/dist/cjs";
import { config } from "../Config";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

//#region

export type Token = {
  auditor: string;
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Auth
 |--------------------------------------------------------------------------------
 */

//#region

export class Auth {
  public readonly token?: string;
  public readonly auditor: string;
  public readonly access: AccessControl;

  constructor(token?: string, auditor?: string, access?: AccessControl) {
    this.token = token;
    this.auditor = auditor ?? "guest";
    this.access = access ?? new AccessControl(this.auditor, {});
  }

  public static async resolve(token: string): Promise<Auth> {
    const { auditor } = await verify(token);
    const access = await AccessControl.for(auditor);
    return new Auth(token, auditor, access);
  }

  public async isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.token === undefined) {
        return resolve(false);
      }
      jwt.verify(this.token, config.jwt.secret);
    });
  }
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region

async function verify(token: string) {
  return new Promise<Token>((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded as Token);
    });
  });
}

//#endregion
