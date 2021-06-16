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
  .set("UserCreated", function ({ data }: UserCreated) {
    return {
      ...this,
      id: data.id,
      name: data.name,
      email: data.email
    };
  })
  .set("UserEmailSet", function ({ data }: UserEmailSet) {
    return {
      ...this,
      email: data.email
    };
  })
  .set("UserNameSet", function ({ data }: UserNameSet) {
    return {
      ...this,
      name: data.name
    };
  });
