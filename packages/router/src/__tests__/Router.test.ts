import { createMemoryHistory, Route, Router } from "..";

const router = new Router(createMemoryHistory(), { base: "/app" });
const routes = [
  new Route("foo", {
    id: "foo",
    path: "/foo"
  })
];

const mockRender = jest.fn();
const mockError = jest.fn();

describe("Router", () => {
  beforeAll(() => {
    router.listen({
      render: mockRender,
      error: mockError
    });
  });

  describe(".register()", () => {
    it("should successfully register routes", () => {
      router.register(routes);
      expect(router.routes).toEqual(routes);
    });
  });

  describe(".goTo()", () => {
    it("should trigger render on valid path", () => {
      router.goTo("/foo");
      expect(mockRender).toBeCalledTimes(1);
    });

    it("should trigger error on invalid path", () => {
      router.goTo("/bar");
      expect(mockError).toBeCalledTimes(1);
    });
  });

  describe(".get()", () => {
    it("should resolve a valid route", () => {
      const result = router.get("/app/foo");
      expect(result).toBeDefined();
      expect(result!.route).toEqual(routes[0]);
    });

    it("should return undefined on invalid route", () => {
      expect(router.get("/foo")).toBeUndefined();
    });
  });
});
