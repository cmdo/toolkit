import { Route, router } from "cmdo-http";

router.register([
  Route.get("", [
    async function () {
      return this.respond({
        service: "production",
        version: "0.0.1-DEV"
      });
    }
  ])
]);
