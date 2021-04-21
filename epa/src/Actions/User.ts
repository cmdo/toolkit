import { container } from "cmdo-events";
import { nanoid } from "nanoid";

import { UserCreated } from "../Events/UserCreated";
import { UserEmailSet } from "../Events/UserEmailSet";
import { UserNameSet } from "../Events/UserNameSet";
import { reducer } from "../Reducers/User";

/**
 * Create a new user.
 *
 * @param name  - Full name.
 * @param email - Email address.
 */
export async function createUser(name: string, email: string, store = container.get("EventStore")): Promise<void> {
  await store.save(new UserCreated(nanoid(), name, email));
}

/**
 * Set user email address.
 *
 * @param id    - User id to change email for.
 * @param email - Email address to set.
 */
export async function setUserEmail(id: string, email: string, store = container.get("EventStore")): Promise<void> {
  const state = await store.reduce({ id }, reducer);
  if (state.email === email) {
    return; // email is the same, lets forego this embarresment ...
  }
  await store.save(new UserEmailSet(id, email));
}

/**
 * Set user name.
 *
 * @param id   - User id to change name for.
 * @param name - Name to set.
 */
export async function setUserName(id: string, name: string, store = container.get("EventStore")): Promise<void> {
  const state = await store.reduce({ id }, reducer);
  if (state.name === name) {
    return; // mail is the same, lets forego this embarresment ...
  }
  await store.save(new UserNameSet(id, name));
}
