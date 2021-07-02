import { copy } from "../Utils/Copy";
import type { Collection } from "./Database/Collections";
import { getCollection } from "./Database/Utils";
import { events } from "./Events";
import { observe, observeOne } from "./Observe";
import { getStreamId } from "./Stream";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type BaseAttributes = {
  id: string;
};

type ModelClass<T, A> = {
  new (attributes: A): T;
  $collection: Collection;
  collection: LokiConstructor.Collection;
};

type Subscription<T, A> = {
  subscribe: (next: (value: T) => void) => {
    unsubscribe(): void;
  };
  filter(query?: LokiQuery<LokiObj & A>): void;
};

export type Action<T = unknown> =
  | {
      type: "insert";
      instance: T;
    }
  | {
      type: "update";
      instance: T;
    }
  | {
      type: "delete";
      instance: T;
    };

/*
 |--------------------------------------------------------------------------------
 | Model
 |--------------------------------------------------------------------------------
 */

export abstract class Model<A extends BaseAttributes> {
  public static readonly $collection: Collection;

  public readonly id: string;

  constructor(attributes: BaseAttributes) {
    this.id = attributes.id;
  }

  public get $collection(): Collection {
    return (this as any).constructor.$collection;
  }

  public static get collection(): LokiConstructor.Collection {
    return getCollection(getStreamId(), this.$collection);
  }

  public get collection(): LokiConstructor.Collection {
    return getCollection(getStreamId(), this.$collection);
  }

  /*
   |--------------------------------------------------------------------------------
   | Factories
   |--------------------------------------------------------------------------------
   */

  public static create<A extends BaseAttributes, T extends Model<A>>(this: ModelClass<T, A>, data: A): T {
    return new this(this.collection.insert(data)).save("insert");
  }

  /*
   |--------------------------------------------------------------------------------
   | Observers
   |--------------------------------------------------------------------------------
   */

  public static observe<A extends BaseAttributes, T extends Model<A>>(this: ModelClass<T, A>): Subscription<T[], A>;
  public static observe<A extends BaseAttributes, T extends Model<A>>(
    this: ModelClass<T, A>,
    sortFn: (a: T, b: T) => number
  ): Subscription<T[], A>;
  public static observe<A extends BaseAttributes, T extends Model<A>>(
    this: ModelClass<T, A>,
    query: LokiQuery<LokiObj & A>
  ): Subscription<T[], A>;
  public static observe<A extends BaseAttributes, T extends Model<A>>(
    this: ModelClass<T, A>,
    query: LokiQuery<LokiObj & A>,
    sortFn: (a: T, b: T) => number
  ): Subscription<T[], A>;
  public static observe<A extends BaseAttributes, T extends Model<A>>(
    this: ModelClass<T, A>,
    query?: LokiQuery<LokiObj & A>,
    sortFn?: (a: T, b: T) => number
  ): Subscription<T[], A> {
    let unsubscribe: () => void;
    let next: (value: T[]) => void;

    if (typeof query === "function") {
      sortFn = query;
      query = undefined;
    }

    return {
      subscribe: (_next: (value: T[]) => void) => {
        next = _next;
        unsubscribe = observe(this, query, (instances: T[]) => {
          next(sortFn ? instances.sort(sortFn) : instances);
        });
        return {
          unsubscribe() {
            // console.log("Unsubscribe observe"); // muting this.
            unsubscribe();
          }
        };
      },
      filter: (query) => {
        unsubscribe();
        unsubscribe = observe(this, query, (instances: T[]) => {
          next(sortFn ? instances.sort(sortFn) : instances);
        });
      }
    };
  }

  public static observeOne<A extends BaseAttributes, T extends Model<A>>(
    this: ModelClass<T, A>,
    query?: LokiQuery<LokiObj & A>
  ): Subscription<T | undefined, A> {
    let unsubscribe: () => void;
    let next: (value?: T) => void;
    return {
      subscribe: (_next: (value?: T) => void) => {
        next = _next;
        unsubscribe = observeOne(this, query, (instance: T | undefined) => {
          next(instance);
        });
        return {
          unsubscribe() {
            // console.log("Unsubscribe observeOne"); // muting this.
            unsubscribe();
          }
        };
      },
      filter: (query) => {
        unsubscribe();
        unsubscribe = observeOne(this, query, (instance: T | undefined) => {
          next(instance);
        });
      }
    };
  }

  /*
   |--------------------------------------------------------------------------------
   | Readers
   |--------------------------------------------------------------------------------
   */

  /**
   * Retrieve a list of database records.
   *
   * @param query - Attribute data to insert in the collection.
   *
   * @returns List of resolved instances.
   */
  public static find<A extends BaseAttributes, T extends Model<A>>(this: ModelClass<T, A>, query?: LokiQuery<LokiObj & A>): T[] {
    return this.collection.find(query).map((record) => new this(record));
  }

  /**
   * Retrieve single database record by unique index.
   *
   * @param query - Attribute data to insert in the collection.
   *
   * @returns Resolved instance or undefined.
   */
  public static findBy<A extends BaseAttributes, T extends Model<A>>(
    this: ModelClass<T, A>,
    field: keyof A,
    value: any
  ): T | undefined {
    const record = this.collection.by(field, value);
    if (record) {
      return new this(record);
    }
  }

  /**
   * Retrieve a single database record.
   *
   * @param query - Attribute data to insert in the collection.
   *
   * @returns Resolve instance or undefined.
   */
  public static findOne<A extends BaseAttributes, T extends Model<A>>(
    this: ModelClass<T, A>,
    query?: LokiQuery<LokiObj & A>
  ): T | undefined {
    const record = this.collection.findOne(query);
    if (record) {
      return new this(record);
    }
  }

  /*
   |--------------------------------------------------------------------------------
   | Mutators
   |--------------------------------------------------------------------------------
   */

  /**
   * Update the given data record.
   *
   * @param data - Attributes to update.
   *
   * @returns Updated model.
   */
  public update<T extends Model<A>>(this: T, data: Partial<A>): T {
    const prevRecord = this.collection.by("id", this.id);
    if (prevRecord) {
      const nextRecord = this.collection.update({ ...prevRecord, ...data });
      return new (this.constructor as ModelClass<T, this>)(nextRecord).save("update");
    }
    return this;
  }

  /**
   * Delete the model record.
   */
  public delete(): void {
    const record = this.collection.by("id", this.id);
    if (record) {
      this.collection.remove(record);
    }
    this.save("delete");
  }

  /*
   |--------------------------------------------------------------------------------
   | Event Handlers
   |--------------------------------------------------------------------------------
   |
   | Methods that provides functionality for decoupled communication between
   | multiple model instances throughout the application.
   |
   */

  /**
   * Emit an event to all observers of the
   *
   * @remarks
   * This method is mainly used to trigger side effects in children or owner
   * models that might be listening for decoupled changes.
   *
   * @param target - Model id or an array of ids.
   * @param action - Arguments to pass to listener.
   *
   * @returns This
   */
  public save<T extends Model<A>>(type: Action<T>["type"]): this {
    events.model.emit(this.$collection, { type, instance: this });
    events.database.emit("save", getStreamId());
    return this;
  }

  /*
   |--------------------------------------------------------------------------------
   | Serializer
   |--------------------------------------------------------------------------------
   */

  /**
   * Serialize the model to JSON.
   *
   * @returns Model attributes as JSON.
   */
  public toJSON(props: any): A {
    return copy.json<A>({
      id: this.id,
      ...props
    });
  }
}
