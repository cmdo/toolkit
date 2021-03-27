import { publisher, EventSubscriber, getUnixTimestamp } from "cmdo-domain";

import { SampleCreated } from "../Domains/Sample/Events/SampleCreated";
import { SampleTextSet } from "../Domains/Sample/Events/SampleTextSet";
import { Sample } from "../Models/Sample";

publisher.subscribe(
  new EventSubscriber(SampleCreated, (event) => {
    Sample.create({
      id: event.id,
      text: event.text,
      createdAt: getUnixTimestamp(event.meta.oid)
    });
  })
);

publisher.subscribe(
  new EventSubscriber(SampleTextSet, (event) => {
    const sample = Sample.findBy("id", event.id);
    if (sample) {
      sample.update({
        text: event.text
      });
    }
  })
);
