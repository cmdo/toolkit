/*
 |--------------------------------------------------------------------------------
 | Actions
 |--------------------------------------------------------------------------------
 */

type EventHandler<State> = (this: State, event: any) => State;

/*
 |--------------------------------------------------------------------------------
 | Event Reducer
 |--------------------------------------------------------------------------------
 */

export class EventReducer<State = unknown> {
  public actions: Map<string, EventHandler<State>> = new Map();

  /**
   * Add new event handler to the event reducer.
   *
   * @param type    - Event type to register the handler for.
   * @param handler - Handler method used for reducing event state.
   *
   * @returns EventReducer.
   */
  public set(type: string, handler: EventHandler<State>): this {
    this.actions.set(type, handler);
    return this;
  }

  /**
   * Reduce state against given event.
   *
   * @param state - State being reduced.
   * @param event - Event to reduce.
   *
   * @returns State.
   */
  public reduce = (state: State, event: any): State => {
    return this.actions.get(event.type)?.call(state, event) || state;
  };
}
