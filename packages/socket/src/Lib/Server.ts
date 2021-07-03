import * as http from "http";
import { URL } from "url";
import WebSocket from "ws";

import type { Action } from "./Action";
import * as responses from "./Action";
import { Client } from "./Client";
import { Room } from "./Room";
import { Route } from "./Route";

type Settings = {
  urlPath: string;
};

/*
 |--------------------------------------------------------------------------------
 | Server
 |--------------------------------------------------------------------------------
 */

//#region Server

export class Server {
  public routes = new Map<string, Action[]>();

  public rooms = new Map<string, Set<WebSocket>>();

  public settings: Settings;
  public actions: Action[];

  private _server?: WebSocket.Server;

  constructor(settings?: Partial<Settings>, actions: Action[] = []) {
    this.settings = {
      urlPath: settings?.urlPath ?? "/socket"
    };
    this.actions = actions;
  }

  /*
   |--------------------------------------------------------------------------------
   | Server
   |--------------------------------------------------------------------------------
   */

  //#region Server

  public set server(server: WebSocket.Server) {
    this._server = server;
  }

  public get server(): WebSocket.Server {
    if (!this._server) {
      throw new Error("WebSocket Server Violation > Server instance has not been assigned!");
    }
    return this._server;
  }

  public get clients() {
    return this.server.clients;
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Setup
   |--------------------------------------------------------------------------------
   */

  //#region Setup

  public register(routes: Route[]) {
    for (const route of routes) {
      this.routes.set(route.event, [...this.actions, ...route.actions]);
    }
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Connect
   |--------------------------------------------------------------------------------
   */

  //#region Connect

  public connect(portOrServer: number | http.Server): void {
    if (typeof portOrServer === "number") {
      this.server = new WebSocket.Server({ port: portOrServer });
    } else {
      this.server = new WebSocket.Server({ noServer: true });
      this.addUpgradeListener(portOrServer);
    }
    this.addConnectionListener();
  }

  private addUpgradeListener(httpServer: http.Server): void {
    httpServer.on("upgrade", (req, socket, head) => {
      const pathname = getPathname(req);
      if (pathname === this.settings.urlPath) {
        this.server.handleUpgrade(req, socket, head, (ws) => {
          this.server.emit("connection", ws, req);
        });
      } else {
        socket.destroy();
      }
    });
  }

  private addConnectionListener(): void {
    this.server.on("connection", (socket) => {
      const client = new Client(this, socket);

      console.log(`WebSocket Server > Client ${client.id} connected.`);

      socket.on("message", (value) => {
        if (typeof value === "string") {
          this.onMessage(client, JSON.parse(value));
        }
      });

      socket.on("close", () => {
        console.log(`WebSocket Server > Client ${client.id} disconnected.`);
      });
    });
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Rooms
   |--------------------------------------------------------------------------------
   */

  //#region Channels

  /**
   * Assign provided socket to the provided room.
   *
   * @param name   - Name of room to join.
   * @param socket - Socket to assign to the room.
   *
   * @returns Server
   */
  public join(name: string, socket: WebSocket) {
    const room = this.rooms.get(name);
    if (room) {
      room.add(socket);
    } else {
      this.rooms.set(name, new Set([socket]));
    }
    return this;
  }

  /**
   * Remove provided socket from the provided room.
   *
   * @param name   - Name of room to leave.
   * @param socket - Socket to remove from the room.
   *
   * @returns Server
   */
  public leave(name: string, socket: WebSocket) {
    const room = this.rooms.get(name);
    if (room) {
      room.delete(socket);
    }
    return this;
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Emitters
   |--------------------------------------------------------------------------------
   */

  //#region Emitters

  /**
   * Broadcast a event to all clients.
   *
   * @param event - Broadcast event name.
   * @param data  - Data object to send.
   *
   * @returns Server
   */
  public broadcast(event: string, data: Record<string, unknown> = {}) {
    for (const client of this.server.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    }
    return this;
  }

  /**
   * Broadcast a event to all clients in the provided room.
   *
   * @param name - Name of the room to broadcast too.
   *
   * @returns Room
   */
  public to(name: string): Room {
    return new Room(this).to(name);
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Listeners
   |--------------------------------------------------------------------------------
   */

  //#region Listeners

  private async onMessage(client: Client, { id, event, data }: any): Promise<void> {
    const actions = this.routes.get(event);
    if (!actions) {
      return client.socket.send(
        JSON.stringify({ id, data: { status: "rejected", message: `Socket Violation > Event '${event}' has no registered handler.` } })
      );
    }
    for (const action of actions) {
      const res = await action.call(responses, client, data);
      switch (res.status) {
        case "accepted": {
          break;
        }
        case "rejected":
        case "respond": {
          return client.socket.send(JSON.stringify({ id, data: res }));
        }
      }
    }
  }

  //#endregion
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region Utilities

function getPathname(req: any): string {
  return new URL(req.url, req.protocol + "://" + req.headers.host + "/").pathname;
}

//#endregion
