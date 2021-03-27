import { EventEmitter } from "eventemitter3";
import { MongoClient } from "mongodb";

export class Mongo extends EventEmitter {
  public readonly name: string;
  public readonly client: MongoClient;

  /**
   * Create a new mongodb node.
   *
   * @param name    - Database name to run queries against.
   * @param uri     - Database connection endpoint.
   */
  constructor(name: string, uri: string) {
    super();
    this.name = name;
    this.client = new MongoClient(uri, {
      poolSize: 10,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ignoreUndefined: false
    });
  }

  /**
   * Connects the mongodb client to the server and keeps it alive.
   *
   * @returns mongodb instance
   */
  public async connect() {
    await this.client.connect();

    // ### Connect Actions

    this.emit("connected");

    // ### Close Event

    this.client.on("close", () => {
      this.emit("disconnected");
      this.connect();
    });
  }

  /**
   * Get database instance.
   *
   * @param name - Name of the database.
   *
   * @returns database
   */
  public get db() {
    return this.client.db(this.name);
  }

  /**
   * Get a mongodb collection to perform query operations on.
   *
   * @param name - Name of the collection.
   *
   * @returns mongodb collection
   */
  public collection<T = any>(name: string) {
    return this.db.collection<T>(name);
  }
}
