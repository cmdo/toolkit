import { AccessControl } from "cmdo-access";
import decode from "jwt-decode";
import type { Token } from "shared";

import { router } from "../Router";
import { api } from "./Request";

export const auth = new (class Auth {
  private _token?: Token;
  private _access?: AccessControl;

  /*
   |--------------------------------------------------------------------------------
   | Accessors
   |--------------------------------------------------------------------------------
   */

  //#region Accessors

  public get isAuthenticated() {
    return this._token !== undefined;
  }

  public get token() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Auth.AuthenticationMissingError();
    }
    return token;
  }

  public get account() {
    if (!this._token) {
      throw new Auth.AuthenticationMissingError();
    }
    return this._token.auditor;
  }

  public get access() {
    if (!this._access) {
      throw new Auth.AuthenticationMissingError();
    }
    return this._access;
  }

  public get tenants() {
    if (!this._token) {
      throw new Auth.AuthenticationMissingError();
    }
    return this._token.tenants;
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  //#region Utilities

  public async load() {
    const token = localStorage.getItem("token");
    const grants = localStorage.getItem("grants");

    if (!token || !grants) {
      return;
    }

    this.setToken(token);
    if (navigator.onLine) {
      await this.renew();
    }

    this.setAccess(new AccessControl(this.account, JSON.parse(grants)));
    if (navigator.onLine) {
      this.setAccess(await AccessControl.for(this.account));
    }
  }

  public async sign(token: string) {
    this.setToken(await this.getToken(token));
    this.setAccess(await AccessControl.for(this.account));
  }

  public async logout() {
    return api.delete("/auth").finally(() => {
      this.destroy();
      router.goTo("/");
    });
  }

  private setToken(token: string) {
    this._token = decode<Token>(token);
    localStorage.setItem("token", token);
  }

  private setAccess(access: AccessControl) {
    this._access = access;
    localStorage.setItem("grants", JSON.stringify(access.toJSON()));
  }

  private destroy() {
    this._token = undefined;
    localStorage.removeItem("token");
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Resolvers
   |--------------------------------------------------------------------------------
   */

  //#region Resolvers

  private async getToken(code: string) {
    const res = await api.get(`/auth/sign?token=${code}`);
    switch (res.status) {
      case "success": {
        return res.data;
      }
      case "error": {
        throw new Auth.InvalidSignatureError();
      }
    }
  }

  private async renew() {
    const res = await api.get("/auth/renew");
    switch (res.status) {
      case "success": {
        this.setToken(res.data);
        break;
      }
      case "error": {
        await this.logout();
        break;
      }
    }
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Errors
   |--------------------------------------------------------------------------------
   */

  //#region Errors

  private static AuthenticationMissingError = class extends Error {
    public readonly type = "AuthenticationMissingError" as const;

    constructor() {
      super("Auth Violation: Credentials requested on an unauthenticated session.");
    }
  };

  private static InvalidSignatureError = class extends Error {
    public readonly type = "InvalidSignatureError" as const;

    constructor() {
      super("Magic code provided is invalid or has expired. Please try again.");
    }
  };

  //#endregion
})();
