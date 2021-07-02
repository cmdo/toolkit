import type { APISection } from "../Types";

export const stream: APISection = {
  type: "api",
  name: "Stream",
  description: "Managing streams",
  endpoints: [
    {
      method: "POST",
      endpoint: "/streams"
    },
    {
      method: "POST",
      endpoint: "/streams/:stream/events"
    },
    {
      method: "POST",
      endpoint: "/streams/:stream/sync"
    }
  ],
  models: [
    {
      name: "Event",
      attributes: [
        {
          name: "stream",
          type: "string",
          description: "Unique identifier for the event object."
        },
        {
          name: "localId",
          type: "string",
          description: "Unique identifier relative to the API."
        },
        {
          name: "originId",
          type: "string",
          description: "Unique identifier relative to the event origin."
        },
        {
          name: "data",
          type: "object",
          description: "Event data."
        }
      ],
      sample: {}
    }
  ],
  methods: [
    {
      title: "Create a stream",
      description: "Create a new stream with the given ID",
      parameters: [
        {
          name: "id",
          tags: [
            {
              value: "required",
              color: "red"
            }
          ],
          description: "ID of the stream to create."
        }
      ],
      request: {
        id: "xyz"
      },
      response: {
        status: 204
      }
    }
  ]
};
