import { AccessControl } from "../Lib/AccessControl";
import { AccessPermission } from "../Lib/AccessPermission";

/**
 * Policy handler.
 *
 * @param data   - Data being validated.
 * @param acid   - Access control id to check validation under.
 * @param access - Access control instance.
 *
 * @return access permission
 */
export type AccessPolicy = (data: any, account: string, access: AccessControl) => Promise<AccessPermission | void>;
