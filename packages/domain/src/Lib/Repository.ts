import { container } from "../Container";
import { AggregateClass, AggregateRoot } from "./AggregateRoot";

export class Repository<T extends AggregateRoot> {
  constructor(private aggregate: AggregateClass<T>, private storage = container.get("EventStore")) {}

  /**
   * Commit aggregate changes to the event store.
   *
   * @param aggregate - Aggregate to save.
   */
  public async save(aggregate: T): Promise<void> {
    await this.storage.save(aggregate.changes);
  }

  /**
   * Get aggregate instance by id.
   *
   * @param id - Aggregate entity id.
   *
   * @returns AggregateRoot.
   */
  public async getById(id: string): Promise<T> {
    const events = await this.storage.getEventsForAggregate(id);
    return this.aggregate.instance(id, events.length).loadFromHistory(events);
  }
}
