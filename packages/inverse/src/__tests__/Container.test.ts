import { container } from "../__mocks__/Container";
import { Axe } from "../__mocks__/Providers/Axe";
import { Katana } from "../__mocks__/Providers/Katana";
import { Ninja } from "../__mocks__/Providers/Ninja";
import { Viking } from "../__mocks__/Providers/Viking";

container.set("ninja", Ninja);
container.set("viking", Viking);
container.set("axe", new Axe());
container.set("katana", new Katana());

/*
 |--------------------------------------------------------------------------------
 | Unit Tests
 |--------------------------------------------------------------------------------
 */

describe("Container", () => {
  const ninja = container.get("ninja", "katana");
  const viking = container.get("viking", "axe");

  it("should resolve correct warrior instances", () => {
    expect(ninja).toBeInstanceOf(Ninja);
    expect(viking).toBeInstanceOf(Viking);
  });

  it("should resolve correct fight results", () => {
    expect(ninja.fight()).toEqual("slice");
    expect(viking.fight()).toEqual("chop");
  });
});
