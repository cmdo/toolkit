import { AccessGrantsResources, AccessPermissionHandler } from "../Types";
import { AccessPermission } from "./AccessPermission";

export class AccessQuery {
  public readonly resources: AccessGrantsResources;

  /**
   * Create a new AccessQuery instance.
   *
   * @param grants - Underlying grants model against which the permissions will be queried, and checked.
   */
  constructor(resources: AccessGrantsResources = {}) {
    this.resources = resources;
    Object.freeze(this);
  }

  /**
   * Query the underlying grant model, and checks whether the current grant
   * can perform an action against the provided resource.
   *
   * @param action   - Defines the action wished to be taken.
   * @param resource - Defines the resource to perform the action against.
   * @param handler  - Optional query action handler.
   *
   * @returns AccessPermission.
   */
  public can<T = unknown>(action: string, resource: string, handler: AccessPermissionHandler<T> = defaultPermissionHandler): AccessPermission {
    const granted = this.resources?.[resource]?.[action];
    if (!granted) {
      return new AccessPermission({ granted: false });
    }
    return handler(granted);
  }
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

/**
 * Default granted permission handler.
 *
 * @remarks
 * This default fallback is used for simple resource actions with a boolean
 * value which always resolved to true.
 *
 * @returns AccessPermission.
 */
function defaultPermissionHandler() {
  return new AccessPermission({ granted: true });
}
