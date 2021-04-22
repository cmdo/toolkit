import { nanoid } from "nanoid";
import { UserCreated, UserEmailSet, UserNameSet, userReducer } from "shared";

import { store } from "../Providers/EventStore";

/**
 * Create a new user.
 *
 * @param name  - Full name.
 * @param email - Email address.
 */
export async function createUser(name: string, email: string): Promise<void> {
  await store.save(new UserCreated(nanoid(), name, email));
}

/**
 * Set user email address.
 *
 * @param id    - User id to change email for.
 * @param email - Email address to set.
 */
export async function setUserEmail(id: string, email: string): Promise<void> {
  const state = await store.reduce({ id }, userReducer);
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
export async function setUserName(id: string, name: string): Promise<void> {
  const state = await store.reduce({ id }, userReducer);
  if (state.name === name) {
    return; // mail is the same, lets forego this embarresment ...
  }
  await store.save(new UserNameSet(id, name));
}
