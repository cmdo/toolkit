export const config = {
  mongo: {
    name: process.env.MONGO_STREAMS_NAME || "toolkit",
    uri: process.env.MONGO_STREAMS_URI || "mongodb://localhost:27027"
  }
};
