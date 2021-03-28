export abstract class Command {
  public abstract readonly type: string;

  constructor(public readonly id: string) {}
}
