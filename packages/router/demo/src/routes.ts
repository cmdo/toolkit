import About from "./About.svelte";
import Home from "./Home.svelte";
import { Request, Response, Route, router } from "./router";

async function setPageTitle(this: Response, req: Request) {
  window.document.title = `Router Demo | ${req.route.title}`;
  return this.accept();
}

async function delay(this: Response) {
  await new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, Math.floor(Math.random() * (2000 - 500 + 1) + 500));
  });
  return this.accept();
}

async function redirect(this: Response) {
  return this.redirect("https://google.com", true);
}

router.register([
  new Route(Home, {
    id: "home",
    title: "Home",
    path: "/",
    before: [setPageTitle, delay]
  }),
  new Route(About, {
    id: "about",
    title: "About",
    path: "/about",
    before: [setPageTitle, delay, delay]
  }),
  new Route(About, {
    id: "about-external",
    title: "About External",
    path: "/external",
    before: [setPageTitle, redirect]
  })
]);
