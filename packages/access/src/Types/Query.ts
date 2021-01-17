import { AccessPermission } from "../Lib/AccessPermission";

/**
 * Retrieve access permission handler with provided data.
 *
 * @param data - Data to validate against grant action.
 *
 * @returns AccessPermissionHandler
 */
export type AccessQueryHandler<Data = unknown, Grant = unknown> = (data: Data) => AccessPermissionHandler<Grant>;

/**
 * Retrieve access permission by validating the action.
 *
 * @param action - Granted action details.
 *
 * @returns AccessPermission
 */
export type AccessPermissionHandler<Grant = unknown> = (grant: Grant) => AccessPermission;
