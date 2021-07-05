import WebSocket from "ws";

import { Room } from "./Room";
import type { Server } from "./Server";
import { uuid } from "./Utils";

/*
 |--------------------------------------------------------------------------------
 | Interfaces
 |--------------------------------------------------------------------------------
 */

//#region

interface SocketClient {
  id: string;
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Client
 |--------------------------------------------------------------------------------
 */

//#region

export class Client implements SocketClient {
  public id: string;

  constructor(public readonly server: Server, public readonly socket: WebSocket) {
    this.id = uuid();
  }

  /**
   * Broadcast a event to all clients except this client.
   *
   * @param event - Broadcast event name.
   * @param data  - Data object to send.
   *
   * @returns Client
   */
  public broadcast(event: string, data: Record<string, unknown> = {}) {
    for (const client of this.server.clients) {
      if (client !== this.socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    }
    return this;
  }

  /**
   * Broadcast a event to all clients in the provided room except this client.
   *
   * @param name - Name of the room to broadcast too.
   *
   * @returns Room
   */
  public to(name: string): Room {
    return new Room(this.server, new Map<WebSocket, boolean>().set(this.socket, true)).to(name);
  }

  /**
   * Assign client to server room.
   *
   * @param name - Name of room to join.
   *
   * @returns Client
   */
  public join(name: string) {
    console.log(`WebSocket Room > Client ${this.id} entered ${name}`);
    this.server.join(name, this.socket);
    return this;
  }

  /**
   * Remove client from a server room.
   *
   * @param name - Name of room to leave.
   *
   * @returns Client
   */
  public leave(name: string) {
    console.log(`WebSocket Room > Client ${this.id} left ${name}`);
    this.server.leave(name, this.socket);
    return this;
  }
}

//#endregion
