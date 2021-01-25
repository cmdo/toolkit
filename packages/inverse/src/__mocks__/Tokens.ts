import { WarriorToken } from "./Services/Warrior";
import { WeaponToken } from "./Services/Weapon";

export type Weapons = {
  axe: WeaponToken;
  katana: WeaponToken;
};

export type Warriors = {
  ninja: WarriorToken<keyof Weapons>;
  viking: WarriorToken<keyof Weapons>;
};
