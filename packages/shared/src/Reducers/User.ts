import type { UserCreated } from "../Events/UserCreated";
import type { UserEmailSet } from "../Events/UserEmailSet";
import type { UserNameSet } from "../Events/UserNameSet";

type Event = UserCreated | UserNameSet | UserEmailSet;

type State = {
  id: string;
  name: string;
  email: string;
};

const initialState = {
  id: "",
  name: "",
  email: ""
};

/**
 * Event reducer for user events.
 *
 * @param state - User state.
 * @param event - User event.
 *
 * @returns State.
 */
export function reducer(state: State = initialState, event: Event): State {
  switch (event.type) {
    case "UserCreated": {
      return {
        id: event.id,
        name: event.name,
        email: event.email
      };
    }
    case "UserEmailSet": {
      return {
        ...state,
        email: event.email
      };
    }
    case "UserNameSet": {
      return {
        ...state,
        name: event.name
      };
    }
    default: {
      return state;
    }
  }
}
