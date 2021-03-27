import type { Collection } from "../Lib/Database";
import type { BaseAttributes } from "../Lib/Model";
import { Model } from "../Lib/Model";

type Attributes = BaseAttributes & {
  text: string;
  createdAt: number;
};

export class Sample extends Model<Attributes> {
  public static readonly $collection: Collection = "samples";

  public readonly text: string;

  public readonly createdAt: Date;

  constructor(attributes: Attributes) {
    super(attributes);

    this.text = attributes.text;
    this.createdAt = new Date(attributes.createdAt);

    Object.freeze(this);
  }

  public toJSON(): Attributes {
    return {
      ...super.toJSON(),
      text: this.text,
      createdAt: this.createdAt.getTime()
    };
  }
}
