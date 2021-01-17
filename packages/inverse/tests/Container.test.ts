import { container } from "./mocks/Container";
import { Axe } from "./mocks/Providers/Axe";
import { Katana } from "./mocks/Providers/Katana";
import { Ninja } from "./mocks/Providers/Ninja";
import { Viking } from "./mocks/Providers/Viking";

container.register("ninja", Ninja);
container.register("viking", Viking);
container.singleton("axe", new Axe());
container.singleton("katana", new Katana());

/*
 |--------------------------------------------------------------------------------
 | Unit Tests
 |--------------------------------------------------------------------------------
 */

describe("Container", () => {
  const ninja = container.resolve("ninja", "katana");
  const viking = container.resolve("viking", "axe");

  it("should resolve correct warrior instances", () => {
    expect(ninja).toBeInstanceOf(Ninja);
    expect(viking).toBeInstanceOf(Viking);
  });

  it("should resolve correct fight results", () => {
    expect(ninja.fight()).toEqual("slice");
    expect(viking.fight()).toEqual("chop");
  });
});
