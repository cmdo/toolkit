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

//#region Types

type Message<T = void | PromiseLike<void> | undefined> = {
  id: string; // Callback id for post/response events
  event: string;
  data: any;
  resolve: (value?: T) => void;
  reject: (reason?: string) => void;
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Socket
 |--------------------------------------------------------------------------------
 */

//#region Socket

class Socket extends EventEmitter {
  public isConnected = false;

  public messages: Message[] = [];

  private ws?: WebSocket;
  private debounce!: NodeJS.Timeout;
  private reconnectDelay = 0;

  constructor(public readonly uri: string) {
    super();
    this.onOpen = this.onOpen.bind(this);
    this.onError = this.onError.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  /*
   |--------------------------------------------------------------------------------
   | Connect
   |--------------------------------------------------------------------------------
   */

  //#region Connect

  public connect(): this {
    this.ws = new WebSocket(this.uri);

    this.ws.onopen = this.onOpen;
    this.ws.onerror = this.onError;
    this.ws.onmessage = this.onMessage;
    this.ws.onclose = this.onClose;

    return this;
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Listeners
   |--------------------------------------------------------------------------------
   */

  //#region Listeners

  public onOpen() {
    console.log("Socket > Connected");

    this.isConnected = true;
    this.reconnectDelay = 0;

    this.emit("connected");
    this.process();
  }

  public onError(ev: Event) {
    console.log("Socket Violation > ", ev);
  }

  public onMessage(msg: MessageEvent<string>) {
    const { id, event, data } = JSON.parse(msg.data);
    this.emit(id ?? event, data);
  }

  public onClose(ev: CloseEvent) {
    console.log("Socket > Closed");

    if (this.isConnected === true) {
      this.emit("disconnected");
    }
    this.isConnected = false;

    if (ev.code !== 4000) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(
        () => {
          this.connect();
        },
        this.reconnectDelay < MAX_RECONNECT_DELAY ? (this.reconnectDelay += RECONNECT_INCREMENT) : MAX_RECONNECT_DELAY
      );
      console.log("Socket > Reconnecting");
    }
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  //#region Utilities

  public join(name: string): this {
    this.post("join", { name })
      .then(() => {
        console.log(`Socket > Joined ${name}`);
      })
      .catch(console.log);
    return this;
  }

  public leave(name: string): this {
    this.post("leave", { name })
      .then(() => {
        console.log(`Socket > Left ${name}`);
      })
      .catch(console.log);
    return this;
  }

  public disconnect(): this {
    this.ws.close(4000, "CLOSED_BY_CLIENT");
    return this;
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Message Queue
   |--------------------------------------------------------------------------------
   */

  //#region Message Queue

  public async post<T extends Record<string, any>>(event: string, data?: T): Promise<any> {
    return new Promise((resolve, reject) => {
      this.messages.push({ id: uuid(), event, data: data ?? {}, resolve, reject });
      this.process();
    });
  }

  private process(): void {
    if (!this.ws || !this.isConnected) {
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
      this.once(message.id, (res: any) => {
        switch (res.status) {
          case "rejected": {
            message.reject(res.message);
            break;
          }
          case "respond": {
            message.resolve(res.data);
            break;
          }
        }
      });
      this.process();
    }
  }

  //#endregion
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Export
 |--------------------------------------------------------------------------------
 */

export const socket = new Socket(config.socket);
