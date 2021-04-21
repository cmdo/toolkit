import { AccessPermission } from "../AccessPermission";

/*
 |--------------------------------------------------------------------------------
 | Mock
 |--------------------------------------------------------------------------------
 */

const accounts = [
  {
    name: "John Doe",
    password: "bcrypt"
  },
  {
    name: "Jane Doe",
    password: "bcrypt"
  }
];

const permission = new AccessPermission({
  granted: true,
  attributes: ["*", "!password"]
});

/*
 |--------------------------------------------------------------------------------
 | Unit Tests
 |--------------------------------------------------------------------------------
 */

describe("AccessPermission", () => {
  it("should filter array", () => {
    expect(permission.filter(accounts)).toEqual(
      accounts.map((account) => ({
        name: account.name
      }))
    );
  });

  it("should filter single object", () => {
    expect(permission.filter(accounts[0])).toEqual({ name: accounts[0].name });
  });
});
