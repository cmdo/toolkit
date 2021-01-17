import { Token } from "../../../src/Types/Token";

type Constructor<Weapon> = {
  new (weapon: Weapon): Warrior;
};

export type Warrior = {
  fight(): string;
};

export type WarriorToken<Weapon> = Token<Constructor<Weapon>, Warrior>;
