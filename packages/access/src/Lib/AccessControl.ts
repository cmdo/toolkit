import { container } from "../Container";
import { AccessGrantsData } from "../Types";
import { AccessGrants } from "./AccessGrants";
import { AccessQuery } from "./AccessQuery";

export class AccessControl {
  private readonly _id: string;
  private readonly _grants: AccessGrantsData;

  /**
   * Create a new AccessControl instance.
   *
   * @param id     - Unique persistent storage id.
   * @param grants - Access control grants.
   */
  constructor(id: string, grants: AccessGrantsData = {}) {
    this._id = id;
    this._grants = grants;
  }

  /**
   * Get AccessControl instance.
   *
   * @param id - Access control id.
   *
   * @returns AccessControl.
   */
  public static async for(id: string, store = container.get("AccessStore")): Promise<AccessControl> {
    return new AccessControl(id, await store.getGrants(id));
  }

  /**
   * Get AccessQuery instance for the provided access control id.
   *
   * @param acid - Access control id.
   *
   * @returns AccessQuery.
   */
  public get(acid: string): AccessQuery {
    return new AccessQuery(this._grants[acid]);
  }

  /**
   * Get AccessGrants instance.
   *
   * @param acid - Access control id.
   *
   * @returns AccessGrants.
   */
  public grants(acid: string): AccessGrants {
    return new AccessGrants(this._id, acid, this._grants);
  }

  /**
   * Get the acccess control grants.
   *
   * @returns AccessGrantsData.
   */
  public toJSON(): AccessGrantsData {
    return this._grants;
  }
}
