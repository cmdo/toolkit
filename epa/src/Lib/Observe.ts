import { match } from "../Utils/Match";
import type { Action, BaseAttributes } from "./Model";
import { events, Model } from "./Model";

class ObserverCache extends Map<string, true> {}

/**
 * Create a query observer and notify of any changes made.
 *
 * @param model - Model being observed.
 * @param query - Query used to filter search results.
 * @param cb    - Callback method to inform of changes.
 *
 * @returns Destructor method.
 */
export function observe<A extends BaseAttributes, T extends Model<any>>(model: any, query: LokiQuery<LokiObj & A> | undefined, cb: (instances: T[]) => void): () => void {
  const cache = new ObserverCache();

  // ### Query
  // Execute model query and add all returned records to the
  // observer cache.

  let instances: T[] = model.find(query);
  for (const instance of instances) {
    cache.set(instance.id, true);
  }

  /**
   * Handle collection change event.
   *
   * @param param.type     - Action type.
   * @param param.instance - Modified instance.
   */
  function handleChange({ type, instance }: Action<T>) {
    const id = instance.id;
    switch (type) {
      case "insert": {
        if (!query || match(query, instance)) {
          insertInstance(instance);
        }
        break;
      }
      case "update": {
        if (cache.has(id)) {
          if (!query || match(query, instance)) {
            updateInstances(instance);
          } else {
            deleteInstance(instance);
          }
        } else if (!query || match(query, instance)) {
          insertInstance(instance);
        }
        break;
      }
      case "delete": {
        if (!query || match(query, instance)) {
          deleteInstance(instance);
        }
        break;
      }
    }
    cb(instances); // emit modified instances back to observer.
  }

  /**
   * Insert instance and update the cache.
   *
   * @param newInstance - Instance to insert.
   */
  function insertInstance(newInstance: T) {
    instances = [...instances, newInstance];
    cache.set(newInstance.id, true);
  }

  /**
   * Update existing record.
   *
   * @param nextInstance - Instance being updated.
   */
  function updateInstances(nextInstance: T) {
    instances = instances.map((prevInstance) => {
      if (nextInstance.id === prevInstance.id) {
        return nextInstance;
      }
      return prevInstance;
    });
  }

  /**
   * Remove the instance and update the cache.
   *
   * @param deletedInstance - Instance to remove.
   */
  function deleteInstance(deletedInstance: T) {
    instances = instances.reduce<T[]>((instances, prevInstance) => {
      if (deletedInstance.id !== prevInstance.id) {
        instances.push(prevInstance);
      }
      return instances;
    }, []);
    cache.delete(deletedInstance.id);
  }

  // ### Initial Result
  // Send the initial search result back to observer.

  cb(instances);

  // ### Start Listener
  // Start listening for collection changes.

  events.addListener(model.$collection, handleChange);

  // ### Return Destructor
  // Return subscription destructor to clean up event listeners when
  // components are destroyed.

  return () => {
    events.removeListener(model.$collection, handleChange);
  };
}

/**
 * Create a singleton query observer and notify of any changes made.
 *
 * @param model - Model being observed.
 * @param query - Query used to filter search result.
 * @param cb    - Callback method to inform of changes.
 *
 * @returns Destructor method.
 */
export function observeOne<A extends BaseAttributes, T extends Model<any>>(
  model: any,
  query: LokiQuery<LokiObj & A> | undefined,
  cb: (instance: T | undefined) => void
): () => void {
  let instance: T | undefined = model.findOne(query);

  /**
   * Handle collection change event.
   *
   * @param param.type     - Action type.
   * @param param.instance - Modified instance.
   */
  function handleChange(action: Action<T>) {
    switch (action.type) {
      case "insert": {
        if (!query || match(query, action.instance)) {
          instance = action.instance;
        }
        break;
      }
      case "update": {
        if (instance) {
          if (instance.id === action.instance.id) {
            if (!query || match(query, action.instance)) {
              instance = action.instance;
            } else {
              instance = model.findOne(query);
            }
          } else {
            if (!query || match(query, action.instance)) {
              instance = action.instance;
            }
          }
        } else {
          if (!query || match(query, action.instance)) {
            instance = action.instance;
          }
        }
        break;
      }
      case "delete": {
        if (instance.id === action.instance.id) {
          instance = model.findOne(query);
        }
        break;
      }
    }
    cb(instance); // emit latest instance back to observer.
  }

  // ### Initial Result
  // Send the initial search result back to observer.

  cb(instance);

  // ### Start Listener
  // Start listening for collection changes.

  events.addListener(model.$collection, handleChange);

  // ### Return Destructor
  // Return subscription destructor to clean up event listeners when
  // components are destroyed.

  return () => {
    events.removeListener(model.$collection, handleChange);
  };
}
