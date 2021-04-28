export class EventReducer<State = unknown> {
  public actions: Map<string, EventHandler<State>> = new Map();

  constructor(public initialState?: Record<string, unknown>) {}

  public set(eventType: string, eventHandler: EventHandler<State>): this {
    this.actions.set(eventType, eventHandler);
    return this;
  }

  public reduce = (state: State, event: any): State => {
    return this.actions.get(event.type)?.call(state, event) || state;
  };
}

type EventHandler<State> = (this: State, event: any) => State;
