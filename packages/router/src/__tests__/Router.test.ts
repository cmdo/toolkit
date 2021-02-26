import { createMemoryHistory, Route, Router } from "..";
import { Request, Response } from "../Before";

/*
 |--------------------------------------------------------------------------------
 | Setup
 |--------------------------------------------------------------------------------
 */

const router = new Router(createMemoryHistory(), { base: "/app" });
const routes = [
  new Route("foo", {
    id: "foo",
    title: "Foo",
    path: "/foo"
  }),
  new Route("middleware", {
    id: "middleware",
    title: "Middleware",
    path: "/middleware",
    before: [addBar]
  })
];

/*
 |--------------------------------------------------------------------------------
 | Middleware
 |--------------------------------------------------------------------------------
 */

async function addBar(this: Response, req: Request) {
  req.state.set("bar", { bar: "foobar" });
  return this.accept();
}

/*
 |--------------------------------------------------------------------------------
 | Mocks
 |--------------------------------------------------------------------------------
 */

const mockRender = jest.fn();
const mockError = jest.fn();

/*
 |--------------------------------------------------------------------------------
 | Tests
 |--------------------------------------------------------------------------------
 */

describe("Router", () => {
  describe("Methods", () => {
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

  describe("Routing", () => {
    describe("middleware", () => {
      it("should add bar to state", async done => {
        router.listen({
          render: async () => {
            expect(router.state.get("bar")).toEqual({ bar: "foobar" });
            done();
          },
          error: mockError
        });
        router.goTo("/middleware");
      });
    });
  });
});
