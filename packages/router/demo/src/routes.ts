import About from "./About.svelte";
import Home from "./Home.svelte";
import { Route, Policy, router } from "./router";

const redirect: Policy = function redirect() {
  return this.redirect("https://google.com", true);
}

router.register([
  new Route(Home, {
    id: "home",
    path: "/"
  }),
  new Route(About, {
    id: "about",
    path: "/about"
  }),
  new Route(About, {
    id: "about",
    path: "/external",
    policies: [redirect]
  })
]);
