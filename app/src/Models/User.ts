import type { Collection } from "../Lib/Database/Collections";
import type { BaseAttributes } from "../Lib/Database/Model";
import { Model } from "../Lib/Database/Model";

type Attributes = BaseAttributes & {
  name: string;
  email: string;
  avatar?: string;
  createdAt: number;
};

export class User extends Model<Attributes> {
  public static readonly $collection: Collection = "users";

  public readonly name: string;
  public readonly email: string;
  public readonly avatar?: string;

  public readonly createdAt: Date;

  constructor(attributes: Attributes) {
    super(attributes);

    this.name = attributes.name;
    this.email = attributes.email;
    this.avatar = attributes.avatar;

    this.createdAt = new Date(attributes.createdAt);

    Object.freeze(this);
  }

  public toJSON() {
    return super.toJSON({
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      createdAt: this.createdAt.getTime()
    });
  }
}
