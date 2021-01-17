import { createBrowserHistory } from "../History";
import { Query } from "../Query";

describe("Query", () => {
  let query: Query;

  it("should create a Query instance", () => {
    query = new Query(createBrowserHistory(), "?foo=bar&bar=foo");
    expect(query).toBeDefined();
  });

  describe(".get()", () => {
    it("should return expected value on a valid key", () => {
      expect(query.get("foo")).toEqual("bar");
      expect(query.get("bar")).toEqual("foo");
    });

    it("should return undefined on an invalid key", () => {
      expect(query.get("foobar")).toBeUndefined();
    });
  });

  describe(".set()", () => {
    it("should update a key if already defined", () => {
      query.set("foo", "foobar");
      query = new Query(query.history, query.history.location.search);
      expect(query.get("foo")).toEqual("foobar");
    });

    it("should create a new key if not already defined", () => {
      query.set("epsilon", "x");
      query = new Query(query.history, query.history.location.search);
      expect(query.get("epsilon")).toEqual("x");
    });
  });

  describe(".unset()", () => {
    it("should remove key if it exists", () => {
      query.unset("foo");
      query = new Query(query.history, query.history.location.search);
      expect(query.get("foo")).toBeUndefined();
    });
  });

  describe(".toString()", () => {
    it("should return a stringified search string", () => {
      expect(query.toString()).toEqual("?bar=foo&epsilon=x");
    });
  });
});
