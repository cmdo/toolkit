export type Collection = "events" | "users";

export const collections: Record<Collection, Partial<CollectionOptions<any>>> = {
  events: {
    unique: ["event.originId"],
    indices: ["tenantId", "streamId"],
    clone: true,
    disableMeta: true
  },
  users: {
    unique: ["id"],
    clone: true,
    disableMeta: true
  }
};
