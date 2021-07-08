import { EventSubscriber, getUnixTimestamp } from "cmdo-events";
import { UserCreated, UserEmailSet, UserNameSet } from "shared";

import { User } from "../Models/User";
import { publisher } from "../Providers/EventPublisher";

publisher.subscribe([
  new EventSubscriber(UserCreated, async ({ originId, data }) => {
    User.create({
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: getUnixTimestamp(originId)
    });
  }),
  new EventSubscriber(UserNameSet, async ({ data }) => {
    const user = User.findBy("id", data.id);
    if (user) {
      console.log({ name: data.name });
      user.update({ name: data.name });
    }
  }),
  new EventSubscriber(UserEmailSet, async ({ data }) => {
    const user = User.findBy("id", data.id);
    if (user) {
      console.log({ email: data.email });
      user.update({ email: data.email });
    }
  })
]);
