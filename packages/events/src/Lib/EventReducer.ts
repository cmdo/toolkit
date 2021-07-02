import type { Event, EventClass } from "./Event";

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

//#region Types

type EventHandler<State, T extends Event = any> = (state: State, event: T) => State;

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Event Reducer
 |--------------------------------------------------------------------------------
 */

//#region Event Reducer

export class EventReducer<State = unknown> {
  public actions: Map<string, EventHandler<State>> = new Map();

  constructor(public initialState?: Record<string, unknown>) {
    this.set = this.set.bind(this);
    this.reduce = this.reduce.bind(this);
  }

  /**
   * Register a new event handler with the reducer.
   *
   * @param event   - Event to reduce.
   * @param reducer - Reducer method to call.
   *
   * @returns EventReducer
   */
  public set<T extends Event>(event: EventClass<T>, reducer: EventHandler<State, T>): this {
    this.actions.set(new event({}, "setup").type, reducer);
    return this;
  }

  /**
   * Apply given event against the provided state.
   *
   * @param state - State to reduce onto.
   * @param event - Event to apply to the state.
   *
   * @returns State
   */
  public reduce(state: State, event: any): State {
    return this.actions.get(event.type)?.(state, event) || state;
  }
}

//#endregion
