import { SocketClient } from "./Lib/Client";

/**
 * Socket state.
 */
export type SocketState = {
  [key: string]: any;
};

/**
 * List of registered event handlers.
 */
export type SocketEventHandlers = {
  [event: string]: {
    handler: SocketEvent;
    args: any[];
  };
};

/**
 * Processes an incoming socket event and returns a result.
 *
 * @param data - Data object provided with the request.
 * @param args - Custom arguments passed in by on registrar.
 *
 * @returns Response or undefined.
 */
export type SocketEvent<P = any, R = any> = (this: SocketClient, props: P, ...args: any[]) => Promise<R>;
