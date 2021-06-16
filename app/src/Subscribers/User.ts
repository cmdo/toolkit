import { EventSubscriber, getUnixTimestamp, publisher } from "cmdo-events";
import { UserCreated, UserEmailSet, UserNameSet } from "shared";

import { User } from "../Models/User";

publisher.subscribe(
  new EventSubscriber(UserCreated, ({ originId, data }) => {
    User.create({
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: getUnixTimestamp(originId)
    });
  })
);

publisher.subscribe(
  new EventSubscriber(UserNameSet, ({ data }) => {
    const user = User.findBy("id", data.id);
    if (user) {
      user.update({ name: data.name });
    }
  })
);

publisher.subscribe(
  new EventSubscriber(UserEmailSet, ({ data }) => {
    const user = User.findBy("id", data.id);
    if (user) {
      user.update({ email: data.email });
    }
  })
);
