import { Token } from "../../../src/Types/Token";

type Constructor = {
  new (): Weapon;
};

export type Weapon = {
  attack(): string;
};

export type WeaponToken = Token<Constructor, Weapon>;
