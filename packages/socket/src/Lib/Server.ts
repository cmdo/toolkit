import * as http from "http";
import * as url from "url";
import WebSocket from "ws";

import { SocketClient } from "./Client";

export type OnSocketConnection = (this: WebSocket, socket: SocketClient) => void;

type Sockets = {
  [uuid: string]: SocketClient;
};

export class SocketServer {
  /**
   * List of connected sockets.
   * @type {Sockets}
   */
  public sockets: Sockets = {};

  /**
   * Create a socket server and wait for incoming connections.
   *
   * @param target        - Port or http server.
   * @param handleConnect - On connect handler.
   */
  public async connect<A = any, S = any>(target: number | http.Server, handleConnect: OnSocketConnection): Promise<void> {
    if (typeof target === "number") {
      this.connectWithPort(target, handleConnect);
    } else {
      this.connectWithServer(target, handleConnect);
    }
  }

  /**
   * Connect with port.
   *
   * @remarks
   * Creates a new WebSocket server listening on its own personal port.
   *
   * @param port          - WebSocket port.
   * @param handleConnect - On connect handler.
   */
  public async connectWithPort(port: number, handleConnect: OnSocketConnection): Promise<void> {
    this.onConnect(new WebSocket.Server({ port }), handleConnect);
  }

  /**
   * Connect with server.
   *
   * @remarks
   * Creates a new WebSocket that injects onto a http server allowing for sharing
   * the same port.
   *
   * @param httpServer    - Http server.
   * @param handleConnect - On connect handler.
   */
  public async connectWithServer(httpServer: http.Server, handleConnect: OnSocketConnection): Promise<void> {
    const server = new WebSocket.Server({ noServer: true });
    this.onConnect(server, handleConnect);
    httpServer.on("upgrade", function upgrade(request, socket, head) {
      const pathname = url.parse(request.url).pathname;

      if (pathname === "/socket") {
        server.handleUpgrade(request, socket, head, function done(ws) {
          server.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  }

  /**
   * Connection handler.
   *
   * @param server        - Server to listen for connection events for.
   * @param handleConnect - On connect handler.
   */
  private onConnect(server: WebSocket.Server, handleConnect: OnSocketConnection): void {
    server.on("connection", socket => {
      const client = new SocketClient(socket);

      console.log(`socket connected ${client.id}`);

      // ### Store Socket
      // Remember the socket so we can provide unique operations and perform server
      // wide messages.

      this.sockets[client.id] = client;

      // ### Provide Socket
      // Send the connected socket to the connect callback for event registration.

      handleConnect.call(socket, client);

      // ### Remove Socket
      // Remove the socket from the socket list if the connection is closed.

      socket.on("close", () => {
        console.log(`socket disconnected ${client.id}`);
        delete this.sockets[client.id];
      });
    });
  }

  /**
   * Publish an event to all the connected sockets.
   *
   * @param event - Event trigger.
   * @param data  - Event data.
   */
  public publish(event: string, data: any): void {
    for (const uuid in this.sockets) {
      this.sockets[uuid].publish(event, data);
    }
  }
}

export const ws = new SocketServer();
