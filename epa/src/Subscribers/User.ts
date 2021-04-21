import { EventSubscriber, getUnixTimestamp, publisher } from "cmdo-events";

import { UserCreated } from "../Events/UserCreated";
import { UserEmailSet } from "../Events/UserEmailSet";
import { UserNameSet } from "../Events/UserNameSet";
import { User } from "../Models/User";

publisher.subscribe(
  new EventSubscriber(UserCreated, (event) => {
    User.create({
      id: event.id,
      name: event.name,
      email: event.email,
      createdAt: getUnixTimestamp(event.originId)
    });
  })
);

publisher.subscribe(
  new EventSubscriber(UserNameSet, (event) => {
    const user = User.findBy("id", event.id);
    if (user) {
      user.update({ name: event.name });
    }
  })
);

publisher.subscribe(
  new EventSubscriber(UserEmailSet, (event) => {
    const user = User.findBy("id", event.id);
    if (user) {
      user.update({ email: event.email });
    }
  })
);
