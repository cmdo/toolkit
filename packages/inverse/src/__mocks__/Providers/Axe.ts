import { Weapon } from "../Services/Weapon";

export class Axe implements Weapon {
  public attack() {
    return "chop";
  }
}
