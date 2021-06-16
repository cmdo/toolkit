import { nanoid } from "nanoid";
import { UserCreated, UserEmailSet, UserNameSet, userReducer } from "shared";

import { store } from "../Providers/EventStore";

export async function createUser(name: string, email: string): Promise<void> {
  await store.save(new UserCreated({ id: nanoid(), name, email }));
}

export async function setUserEmail(id: string, email: string): Promise<void> {
  const state = await store.reduceById(id, userReducer);
  if (state.email === email) {
    return; // email is the same, lets forego this embarresment ...
  }
  await store.save(new UserEmailSet({ id, email }));
}

export async function setUserName(id: string, name: string): Promise<void> {
  const state = await store.reduceById(id, userReducer);
  if (state.name === name) {
    return; // mail is the same, lets forego this embarresment ...
  }
  await store.save(new UserNameSet({ id, name }));
}
