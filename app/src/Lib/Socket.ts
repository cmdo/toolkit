import EventEmitter from "eventemitter3";
import { v4 as uuid } from "uuid";

import { config } from "../Config";
import { auth } from "./Auth";

const RECONNECT_INCREMENT = 1250; // 1.25 seconds
const MAX_RECONNECT_DELAY = 1000 * 60 * 30; // 30 seconds
const HEARTBEAT_INVERVAL = 1000 * 60 * 30; // 30 seconds

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

//#region

type Message<T = void | PromiseLike<void> | undefined> = {
  id: string; // Callback id for post/response events
  event: string;
  data: any;
  resolve: (value?: T) => void;
  reject: (reason?: string) => void;
};

type Debounce = {
  reconnect: NodeJS.Timeout;
  heartbeat: NodeJS.Timeout;
};

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Socket
 |--------------------------------------------------------------------------------
 */

//#region

class Socket extends EventEmitter {
  public messages: Message[] = [];

  private _ws?: WebSocket;
  private _rooms = new Set<string>();
  private _reconnectDelay = 0;
  private _debounce: Debounce = {
    reconnect: undefined,
    heartbeat: undefined
  };

  constructor(public readonly uri: string) {
    super();
    this.connect = this.connect.bind(this);
    this.ping = this.ping.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.onError = this.onError.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  /*
   |--------------------------------------------------------------------------------
   | Accessors
   |--------------------------------------------------------------------------------
   */

  //#region

  public get isConnected() {
    return this._ws?.readyState === WebSocket.OPEN;
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Connect
   |--------------------------------------------------------------------------------
   */

  //#region

  public async connect() {
    return new Promise<void>((resolve) => {
      this._ws = new WebSocket(this.uri);

      this.once("connected", this.onConnect(resolve));

      this._ws.onopen = this.onOpen;
      this._ws.onerror = this.onError;
      this._ws.onmessage = this.onMessage;
      this._ws.onclose = this.onClose;
    });
  }

  public disconnect() {
    this._ws.close(4000, "CLOSED_BY_CLIENT");
    return this;
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Heartbeat
   |--------------------------------------------------------------------------------
   */

  //#region

  public ping() {
    this._debounce.heartbeat = setTimeout(() => {
      if (this.isConnected) {
        this.post("ping").finally(this.ping);
      }
    }, HEARTBEAT_INVERVAL);
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Listeners
   |--------------------------------------------------------------------------------
   */

  //#region

  public onConnect(resolve: () => void): () => Promise<void> {
    return async () => {
      this._reconnectDelay = 0;
      if (auth.isAuthenticated) {
        await this.auth(auth.token);
      }
      for (const room of this._rooms) {
        this.join(room);
      }
      this.ping();
      this.process();
      resolve();
    };
  }

  public onOpen() {
    console.log("Socket > Connected");
    this.emit("connected");
  }

  public onError(ev: Event) {
    console.log("Socket Violation:", ev);
  }

  public onMessage(msg: MessageEvent<string>) {
    const { id, event, data } = JSON.parse(msg.data);
    this.emit(id ?? event, data);
  }

  public onClose(ev: CloseEvent) {
    console.log("Socket > Closed");

    clearTimeout(this._debounce.heartbeat);

    if (ev.code !== 4000) {
      clearTimeout(this._debounce.reconnect);
      this._debounce.reconnect = setTimeout(
        this.connect,
        this._reconnectDelay < MAX_RECONNECT_DELAY ? (this._reconnectDelay += RECONNECT_INCREMENT) : MAX_RECONNECT_DELAY
      );
      console.log("Socket > Reconnecting");
    }

    this.emit("Socket > Disconnected");
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  //#region

  public async auth(token: string) {
    return this.post("auth", { token });
  }

  public join(name: string) {
    this.post("join", { name })
      .then(() => {
        console.log(`Socket > Joined ${name}`);
        this._rooms.add(name);
      })
      .catch(console.log);
    return this;
  }

  public leave(name: string) {
    this.post("leave", { name })
      .then(() => {
        console.log(`Socket > Left ${name}`);
        this._rooms.delete(name);
      })
      .catch(console.log);
    return this;
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Message Queue
   |--------------------------------------------------------------------------------
   */

  //#region

  public async post<T extends Record<string, any>>(event: string, data?: T): Promise<any> {
    return new Promise((resolve, reject) => {
      this.messages.push({ id: uuid(), event, data: data ?? {}, resolve, reject });
      this.process();
    });
  }

  private process(): void {
    if (!this.isConnected) {
      return; // awaiting connection ...
    }
    const message = this.messages.shift();
    if (message) {
      this._ws.send(
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

/*
 |--------------------------------------------------------------------------------
 | Debug
 |--------------------------------------------------------------------------------
 |
 | TODO: Remove before release, or put behind developer flag ... 
 |
 */

declare global {
  interface Window {
    socket: Socket;
  }
}

window.socket = socket;
