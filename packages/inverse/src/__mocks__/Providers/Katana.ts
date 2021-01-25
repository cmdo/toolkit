import { Weapon } from "../Services/Weapon";

export class Katana implements Weapon {
  public attack() {
    return "slice";
  }
}
