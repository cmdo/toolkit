import EventEmitter from "eventemitter3";

import { container } from "../Container";
import { copy } from "../Utils/Copy";
import type { Collection } from "./Database";
import { observe, observeOne } from "./Observe";

export const events = new EventEmitter();

let debounce: NodeJS.Timeout;

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
};

type Subscription<T, A> = {
  subscribe: (
    next: (value: T) => void
  ) => {
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

  /**
   * Create a new Model instance.
   *
   * @param attributes - Attributes data.
   */
  constructor(attributes: BaseAttributes) {
    this.id = attributes.id;
  }

  /**
   * Collection the model belongs to.
   *
   * @returns Collection
   */
  public get $collection(): Collection {
    return (this as any).constructor.$collection;
  }

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  /**
   * Create a new record for the given model.
   *
   * @param data - Attribute data to insert in the collection.
   *
   * @returns Created model instance.
   */
  public static create<A extends BaseAttributes, T extends Model<A>>(this: ModelClass<T, A>, data: A, db = container.get("TenantStore")): T {
    const instance = new this(db.getCollection(this.$collection).insert(data)).save();
    return instance.emit(this.$collection, { type: "insert", instance });
  }

  /**
   * Retrieve a list of observed records.
   *
   * @param query - Attribute data to insert in the collection. Default: undefined
   *
   * @returns List of observed instances.
   */
  public static observe<A extends BaseAttributes, T extends Model<A>>(this: ModelClass<T, A>, query?: LokiQuery<LokiObj & A>): Subscription<T[], A> {
    let unsubscribe: () => void;
    let next: (value: T[]) => void;
    return {
      subscribe: (_next: (value: T[]) => void) => {
        next = _next;
        unsubscribe = observe(this, query, (instances: T[]) => {
          next(instances);
        });
        return {
          unsubscribe() {
            console.log("Unsubscribe observe");
            unsubscribe();
          }
        };
      },
      filter: (query) => {
        unsubscribe();
        unsubscribe = observe(this, query, (instances: T[]) => {
          next(instances);
        });
      }
    };
  }

  /**
   * Retrieve a single observed record.
   *
   * @param query - Attribute data to insert in the collection. Default: undefined
   *
   * @returns Observed instance or undefined.
   */
  public static observeOne<A extends BaseAttributes, T extends Model<A>>(this: ModelClass<T, A>, query?: LokiQuery<LokiObj & A>): Subscription<T | undefined, A> {
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
            console.log("Unsubscribe observeOne");
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

  /**
   * Retrieve a list of database records.
   *
   * @param query - Attribute data to insert in the collection.
   *
   * @returns List of resolved instances.
   */
  public static find<A extends BaseAttributes, T extends Model<A>>(this: ModelClass<T, A>, query?: LokiQuery<LokiObj & A>, db = container.get("TenantStore")): T[] {
    return db
      .getCollection(this.$collection)
      .find(query)
      .map((record) => new this(record));
  }

  /**
   * Retrieve single database record by unique index.
   *
   * @param query - Attribute data to insert in the collection.
   *
   * @returns Resolved instance or undefined.
   */
  public static findBy<A extends BaseAttributes, T extends Model<A>>(this: ModelClass<T, A>, field: keyof A, value: any, db = container.get("TenantStore")): T | undefined {
    const record = db.getCollection(this.$collection).by(field, value);
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
  public static findOne<A extends BaseAttributes, T extends Model<A>>(this: ModelClass<T, A>, query?: LokiQuery<LokiObj & A>, db = container.get("TenantStore")): T | undefined {
    const record = db.getCollection(this.$collection).findOne(query);
    if (record) {
      return new this(record);
    }
  }

  /**
   * Update the given data record.
   *
   * @param data - Attributes to update.
   *
   * @returns Updated model.
   */
  public update<T extends Model<A>>(this: T, data: Partial<A>, db = container.get("TenantStore")): T {
    const prevRecord = db.getCollection(this.$collection).by("id", this.id);
    if (prevRecord) {
      const nextRecord = db.getCollection(this.$collection).update({ ...prevRecord, ...data });
      const instance = new (this.constructor as ModelClass<T, this>)(nextRecord);
      return instance.save().emit(this.$collection, { type: "update", instance });
    }
    return this;
  }

  /**
   * Delete the model record.
   */
  public delete(db = container.get("TenantStore")): void {
    const record = db.getCollection(this.$collection).by("id", this.id);
    if (record) {
      db.getCollection(this.$collection).remove(record);
      this.save();
    }
    this.emit(this.$collection, { type: "delete", instance: this });
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
   * Emit an event to all model observers.
   *
   * @remarks
   * This method is mainly used to trigger side effects in children or parent
   * models that might be listening for decoupled changes.
   *
   * @param target - Model id or an array of ids.
   * @param action - Arguments to pass to listener.
   *
   * @returns This
   */
  public emit<T extends Model<A>>(target: string | string[], action: Action<T>): this {
    if (Array.isArray(target)) {
      for (const id of target) {
        events.emit(id, action);
      }
    } else {
      events.emit(target, action);
    }
    return this;
  }

  /*
   |--------------------------------------------------------------------------------
   | Helpers
   |--------------------------------------------------------------------------------
   */

  /**
   * Store the changes by executing a save operation to the database layer.This is
   * wrapped in a debounce so we don't end up spamming expensive save requests when
   * multiple updates are occurring in rapid sequence. This debounce ensures that
   * we only save the database after half a second of write inactivity across all
   * models.
   *
   * @returns This
   */
  private save(db = container.get("TenantStore")): this {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      db.save();
    }, 500);
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
