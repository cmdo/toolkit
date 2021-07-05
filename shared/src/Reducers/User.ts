import { EventReducer } from "cmdo-events";

import { UserCreated } from "../Events/UserCreated";
import { UserEmailSet } from "../Events/UserEmailSet";
import { UserNameSet } from "../Events/UserNameSet";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

//#region

type State = {
  id: string;
  name: string;
  email: string;
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Reducer
 |--------------------------------------------------------------------------------
 */

//#region

export const reducer = new EventReducer<State>()
  .set(UserCreated, (state, { data }) => {
    return {
      ...state,
      id: data.id,
      name: data.name,
      email: data.email
    };
  })
  .set(UserEmailSet, (state, { data }) => {
    return {
      ...state,
      email: data.email
    };
  })
  .set(UserNameSet, (state, { data }) => {
    return {
      ...state,
      name: data.name
    };
  });

//#endregion
