export const config = {
  api: {
    uri: import.meta.env.VITE_API || "http://localhost:8370"
  },
  socket: import.meta.env.VITE_SOCKET || "ws://localhost:8370/socket"
};
