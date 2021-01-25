import { container } from "../Container";
import { Warrior } from "../Services/Warrior";
import { Weapon } from "../Services/Weapon";
import { Weapons } from "../Tokens";

export class Viking implements Warrior {
  public weapon: Weapon;

  constructor(weapon: keyof Weapons) {
    this.weapon = container.get(weapon);
  }

  public fight() {
    return this.weapon.attack();
  }
}
