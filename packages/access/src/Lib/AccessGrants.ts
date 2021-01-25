import { container } from "../Container";
import { AccessGrantOperation, AccessGrantsData } from "../Types";

export class AccessGrants {
  public readonly id: string;
  public readonly acid: string;
  public readonly grants: AccessGrantsData;

  public operations: AccessGrantOperation[] = [];

  /**
   * Creates a new AccessGrants instance.
   *
   * @param id     - Unique persistent storage id.
   * @param acid   - Access control id to modify grants within.
   * @param grants - Grants being modified.
   */
  constructor(id: string, acid: string, grants: AccessGrantsData, private store = container.get("AccessStore")) {
    this.id = id;
    this.acid = acid;
    this.grants = grants;
  }

  /**
   * Grants access to a specified resource action.
   *
   * @param resource - Resource to create a grant for.
   * @param action   - Action to create a grant under.
   * @param data     - (Optional) Grant data. Default: true
   *
   * @returns AccessGrants
   */
  public grant(resource: string, action: string): AccessGrants;
  public grant<T = unknown>(resource: string, action: string, data: T): AccessGrants;
  public grant<T = unknown>(resource: string, action: string, data: T | boolean = true): AccessGrants {
    this.operations.push({ type: "set", resource, action, data });
    return this;
  }

  /**
   * Remove access to specified resource, or a specific resource action. This removes a previously
   * create grant.
   *
   * @param resource - Resource to deny access to.
   * @param action   - Action to deny access for.
   *
   * @returns AccessGrants
   */
  public deny(resource: string, action?: string): AccessGrants {
    this.operations.push({ type: "unset", resource, action });
    return this;
  }

  /**
   * Commits the grants to the persistent storage.
   */
  public async commit(): Promise<void> {
    await this.store.setGrants(this.id, this.acid, this.operations);
  }
}
