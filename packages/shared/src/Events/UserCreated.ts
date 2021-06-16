import { Event } from "cmdo-events";
import { AES, enc } from "crypto-js";

type Attributes = {
  id: string;
  name: string;
  email: string;
};

export class UserCreated extends Event<Attributes> {
  public readonly type = "UserCreated" as const;

  public encrypt(secret: string) {
    return super.toJSON({
      name: AES.encrypt(this.data.name, secret).toString(),
      email: AES.encrypt(this.data.email, secret).toString()
    });
  }

  public decrypt(secret: string) {
    this.data.name = AES.decrypt(this.data.name, secret).toString(enc.Utf8);
    this.data.email = AES.decrypt(this.data.email, secret).toString(enc.Utf8);
    return this;
  }
}
