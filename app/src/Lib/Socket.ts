import EventEmitter from "eventemitter3";
import { v4 as uuid } from "uuid";

import { config } from "../Config";

const RECONNECT_INCREMENT = 1250;
const MAX_RECONNECT_DELAY = 30000;

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

type SocketMessage = {
  id: string;
  event: string;
  data: any;
  resolve: (value?: void | PromiseLike<void> | undefined) => void;
  reject: (reason?: any) => void;
};

/*
 |--------------------------------------------------------------------------------
 | Socket
 |--------------------------------------------------------------------------------
 */

class Socket extends EventEmitter {
  public id?: string;
  public connected = false;
  public messages: SocketMessage[] = [];

  private ws?: WebSocket;
  private debounce!: NodeJS.Timeout;
  private reconnectDelay = 0;

  /**
   * Connect to websocket server.
   *
   * @param uri - Socket uri.
   *
   * @returns Socket
   */
  public connect(uri = config.socket): this {
    if (!uri) {
      console.warn("Socket was requested to load but no valid uri was provided!");
      return this;
    }

    this.ws = new WebSocket(uri);

    // ### Connected
    // Set connection status to true and process any queued messages.

    this.ws.onopen = () => {
      console.log("Socket connected.");

      this.connected = true;
      this.reconnectDelay = 0;

      this.emit("connected");
      this.process();
    };

    // ### Error

    this.ws.onerror = (event) => {
      console.log("Socket received error.", event);
    };

    // ### Message
    // Handle incoming message and convert it to an emitted event.

    this.ws.onmessage = (msg) => {
      const { id, event, args } = JSON.parse(msg.data);
      this.emit(id || event, ...args);
    };

    // ### Closed
    // Set connection status to false.

    this.ws.onclose = (ev) => {
      console.log("Socket closed.");

      // ### Emit Disconnect Event
      // If current connection state is true, inform any disconnect listeners of the
      // socket connection being closed.

      if (this.connected === true) {
        this.emit("disconnected");
      }

      // ### Update Connection
      // Set the current connection state to false.

      this.connected = false;

      // ### Re-attempt Connection
      // Attempt to re-load socket session with a variable increase in delay between
      // the attempts to reduce spam.

      if (ev.code !== 4000) {
        clearTimeout(this.debounce);
        this.debounce = setTimeout(
          () => {
            this.connect(uri);
          },
          this.reconnectDelay < MAX_RECONNECT_DELAY ? (this.reconnectDelay += RECONNECT_INCREMENT) : MAX_RECONNECT_DELAY
        );
        console.log("Socket re-attempting connection.");
      }
    };

    this.on("handshake", (id) => {
      this.id = id;
    });

    return this;
  }

  /**
   * Disconnect from socket server.
   *
   * @returns Socket
   */
  public disconnect(): this {
    this.ws.close(4000, "CLOSED_BY_CLIENT");
    return this;
  }

  /**
   * Subscribes to a specific event and returns a unsubscribe function.
   *
   * @param event       - Event to subscribe to.
   * @param change      - Function to fire on changes.
   * @param unsubscribe - Function to run when subscription is terminated.
   *
   * @returns unsubscribe function
   */
  public subscribe(event: string, change: (data: any) => void, unsubscribe?: () => void): () => void {
    this.on(event, change);
    return (): void => {
      this.off(event, change);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  /**
   * Emit an even to the socket server.
   *
   * @param event - Event name.
   * @param data  - Event data.
   */
  public async send(event: string, data: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.messages.push({
        id: uuid(),
        event,
        data,
        resolve,
        reject
      });
      this.process();
    });
  }

  /**
   * Process message queue.
   */
  private process(): void {
    if (!this.ws || !this.connected) {
      return; // awaiting connection ...
    }
    const message = this.messages.shift();
    if (message) {
      this.ws.send(
        JSON.stringify({
          id: message.id,
          event: message.event,
          data: message.data
        })
      );

      // ### Callback Response
      // Wait for a callback response by registering a one time response listener
      // for an event with the generated message uuid.

      this.once(message.id, (data: any) => {
        if (data) {
          if (data.error) {
            message.reject(data.error);
          } else {
            message.resolve(data);
          }
        } else {
          message.resolve();
        }
      });

      // ### Process Next
      // Once a message has been sent, we move onto the next message in the queue.

      this.process();
    }
  }
}

/*
 |--------------------------------------------------------------------------------
 | Export
 |--------------------------------------------------------------------------------
 */

export const socket = new Socket();
