import WebSocket from "ws";

import type { Server } from "./Server";

/*
 |--------------------------------------------------------------------------------
 | Room
 |--------------------------------------------------------------------------------
 */

//#region Room

export class Room {
  public clients = new Set<WebSocket>();

  constructor(public server: Server, public readonly excluded: Map<WebSocket, boolean> = new Map()) {}

  /**
   * Assign broadcast target for an event.
   *
   * @param name - Room to broadcast to.
   *
   * @returns Room
   */
  public to(name: string): this {
    const room = this.server.rooms.get(name);
    if (room) {
      for (const client of room) {
        if (client.readyState !== WebSocket.OPEN) {
          this.server.leave(name, client); // clean up trash sockets
        } else {
          this.clients.add(client);
        }
      }
    }
    return this;
  }

  /**
   * Emit a broadcast to all clients within the assigned rooms.
   *
   * @remarks
   *
   * If a client is part of one or more of the assigned rooms, the event is only
   * broadcast once regardless of how many rooms the client is connectd to.
   *
   * @param event - Broadcast event name.
   * @param data  - Data object to send.
   */
  public emit(event: string, data: Record<string, unknown> = {}) {
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN && !this.excluded.has(client)) {
        client.send(JSON.stringify({ event, data }));
      }
    }
  }
}

//#endregion
