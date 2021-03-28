import WebSocket from "ws";

import { SocketEvent, SocketEventHandlers, SocketState } from "../Types";
import { uuid } from "../Utils";

export class SocketClient {
  public id: string;
  public socket: WebSocket;
  public handlers: SocketEventHandlers = {};
  public state: SocketState = {};

  private queue: {
    processing: boolean;
    messages: string[];
  } = {
    processing: false,
    messages: []
  };

  /**
   * Create a new WebSocketClient instance.
   *
   * @param socket - Instantiated WebSocket.
   */
  constructor(socket: WebSocket) {
    this.id = uuid();
    this.socket = socket;
    (this.state as any) = {};
    this.listen();
  }

  /**
   * Subscribe to socket closed event.
   *
   * @param fn - Callback function.
   */
  public closed(cb: () => void): void {
    this.socket.on("close", cb);
  }

  /**
   * Listen for incoming events.
   *
   * @param event   - Event trigger.
   * @param handler - Event handler.
   */
  public on<P = any, R = any>(event: "closed" | string, handler: SocketEvent<P, R>, ...args: any[]): void {
    if (this.handlers[event]) {
      throw new Error(`Event handler for '${event}' has already been registered for this socket.`);
    }
    this.handlers[event] = {
      handler,
      args
    };
  }

  /**
   * Publish a event to the socket.
   *
   * @param event - Event trigger.
   * @param data  - Event data.
   */
  public async publish(event: string, ...args: any[]): Promise<void> {
    this.queue.messages.push(JSON.stringify({ event, args }));
    this.processQueue();
  }

  /**
   * Send a response event to the socket.
   *
   * @param id   - Response id.
   * @param data - Event handler response data.
   */
  public async respond(id: string, ...args: any[]): Promise<void> {
    this.queue.messages.push(JSON.stringify({ id, args }));
    this.processQueue();
  }

  /**
   * Process messages in the queue.
   */
  private async processQueue() {
    if (this.queue.processing) {
      return false; // already processing another message ...
    }
    this.queue.processing = true;
    const msg = this.queue.messages.shift();
    if (msg) {
      await this.socket.send(msg);
      this.queue.processing = false;
      this.processQueue();
    } else {
      this.queue.processing = false;
    }
  }

  /**
   * Listen for socket events and emit them.
   */
  private async listen(): Promise<void> {
    this.socket.on("message", (value: any) => {
      if (typeof value === "string") {
        try {
          const { id, event, data } = JSON.parse(value);
          this.emit(id, event, data);
        } catch (err) {
          this.respond("error", {
            error: {
              code: "EVENT_JSON",
              message: err.message
            }
          });
        }
      }
    });
  }

  /**
   * Emit data to all listeners of the given event.
   *
   * @param id    - Message identifier.
   * @param event - Event being sent.
   * @param data  - Data being sent. Default: {}
   */
  private emit(id: string, event: string, data: any = {}): void {
    const { handler, args } = this.handlers[event];
    if (handler) {
      handler
        .apply(this, [data, ...args])
        .then(res => this.respond(id, res))
        .catch(error => {
          this.respond(id, { error });
        });
    } else {
      this.respond(id, {
        error: {
          code: "NO_HANDLER",
          message: event ? `Event '${event}' does not exist, or has been removed.` : "Request is missing 'event' key."
        }
      });
    }
  }
}
