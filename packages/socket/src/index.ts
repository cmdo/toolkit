export * from "./Lib/Client";
export * from "./Lib/Server";
export * from "./Types";

declare module "http" {
  interface IncomingHttpHeaders {
    socket?: string;
  }
}
