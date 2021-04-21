import type { UserCreated } from "../Events/UserCreated";
import type { UserEmailSet } from "../Events/UserEmailSet";
import type { UserNameSet } from "../Events/UserNameSet";

type State = Pick<UserCreated, "id" | "name" | "email">;
type Event = UserCreated | UserNameSet | UserEmailSet;

/**
 * Event reducer for user events.
 *
 * @param state - User state.
 * @param event - User event.
 *
 * @returns State.
 */
export function reducer(state: State, event: Event): State {
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
  }
}
