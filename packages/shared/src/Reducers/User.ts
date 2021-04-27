import { EventReducer } from "cmdo-events";

import type { UserCreated } from "../Events/UserCreated";
import type { UserEmailSet } from "../Events/UserEmailSet";
import type { UserNameSet } from "../Events/UserNameSet";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type State = {
  id: string;
  name: string;
  email: string;
};

/*
 |--------------------------------------------------------------------------------
 | Reducer
 |--------------------------------------------------------------------------------
 */

export const reducer = new EventReducer<State>()
  .set("UserCreated", function (event: UserCreated) {
    return {
      ...this,
      id: event.id,
      name: event.name,
      email: event.email
    };
  })
  .set("UserEmailSet", function (event: UserEmailSet) {
    return {
      ...this,
      email: event.email
    };
  })
  .set("UserNameSet", function (event: UserNameSet) {
    return {
      ...this,
      name: event.name
    };
  });
