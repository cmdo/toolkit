import { HttpSuccess, Route, router } from "cmdo-http";

router.register([
  new Route({
    method: "get",
    path: "",
    handler: async () => {
      return new HttpSuccess({
        service: "production",
        version: "0.0.1-DEV"
      });
    }
  })
]);
