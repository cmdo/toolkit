/*
 |--------------------------------------------------------------------------------
 | Events
 |--------------------------------------------------------------------------------
 */

import { UserCreated } from "./Events/UserCreated";
import { UserEmailSet } from "./Events/UserEmailSet";
import { UserNameSet } from "./Events/UserNameSet";

export type Event = UserCreated | UserEmailSet | UserNameSet;

export const events = { UserCreated, UserEmailSet, UserNameSet };

export { UserCreated, UserEmailSet, UserNameSet };

/*
 |--------------------------------------------------------------------------------
 | Reducers
 |--------------------------------------------------------------------------------
 */

export { reducer as userReducer } from "./Reducers/User";
