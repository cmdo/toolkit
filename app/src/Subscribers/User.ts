import { EventSubscriber, getUnixTimestamp, publisher } from "cmdo-domain";

import { UserCreated } from "../Domains/User/Events/UserCreated";
import { UserEmailSet } from "../Domains/User/Events/UserEmailSet";
import { UserNameSet } from "../Domains/User/Events/UserNameSet";
import { User } from "../Models/User";

publisher.subscribe(
  new EventSubscriber(UserCreated, (event) => {
    User.create({
      id: event.aggregateId,
      name: event.name,
      email: event.email,
      createdAt: getUnixTimestamp(event.originId)
    });
  })
);

publisher.subscribe(
  new EventSubscriber(UserNameSet, (event) => {
    const user = User.findBy("id", event.aggregateId);
    if (user) {
      user.update({ name: event.name });
    }
  })
);

publisher.subscribe(
  new EventSubscriber(UserEmailSet, (event) => {
    const user = User.findBy("id", event.aggregateId);
    if (user) {
      user.update({ email: event.email });
    }
  })
);
