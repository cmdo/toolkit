import { container } from "../Container";
import { AccessGrantsData } from "../Types";
import { AccessGrants } from "./AccessGrants";
import { AccessQuery } from "./AccessQuery";

export class AccessControl {
  private readonly _id: string;
  private readonly _grants: AccessGrantsData;

  /**
   * Creates a new AccessControl instance.
   *
   * @param id     - Unique persistent storage id.
   * @param grants - Access control grants.
   */
  constructor(id: string, grants: AccessGrantsData = {}) {
    this._id = id;
    this._grants = grants;
  }

  /**
   * Returns a access control instance.
   *
   * @param id - Access control id.
   *
   * @returns AccessControl
   */
  public static async for(id: string, store = container.resolve("AccessStore")): Promise<AccessControl> {
    return new AccessControl(id, await store.getGrants(id));
  }

  /**
   * Returns an AccessQuery instance for the provided access control id space.
   *
   *  1. Generate a access control query instance with provided acid group
   *
   * @param acid - Access control id.
   *
   * @returns AccessQuery
   */
  public get(acid: string): AccessQuery {
    return new AccessQuery(this._grants[acid]);
  }

  /**
   * Returns a new access grant instance for modification of access grants.
   *
   * @param acid - Access Control ID
   *
   * @returns AccessGrants or AccessGrantsData
   */
  public grants(): AccessGrantsData;
  public grants(acid: string): AccessGrants;
  public grants(acid?: string): AccessGrantsData | AccessGrants {
    if (!acid) {
      return this._grants;
    }
    return new AccessGrants(this._id, acid, this._grants);
  }

  /**
   * Access control JSON representation.
   *
   * @returns AccessGrantsData
   */
  public toJSON(): AccessGrantsData {
    return this._grants;
  }
}
