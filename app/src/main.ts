import "./global.css";

import { container as domain } from "cmdo-domain";
import type { SvelteComponent } from "svelte";

import { loadTenant } from "./Lib/Database";
import { socket } from "./Lib/Socket";
import { EventStore } from "./Providers/EventStore";
import { router } from "./Router";

import E401 from "./Views/Errors/401.svelte";
import E404 from "./Views/Errors/404.svelte";
import E500 from "./Views/Errors/500.svelte";
import E503 from "./Views/Errors/503.svelte";

/*
 |--------------------------------------------------------------------------------
 | Route
 |--------------------------------------------------------------------------------
 */

function route(): void {
  const { pathname, search, state } = router.history.location;

  let component: SvelteComponent | undefined;
  const target = document.getElementById("app");
  router.listen({
    render: async (route) => {
      if (component) {
        component.$destroy();
      }
      component = new route.components[0]({ target });
      setAnchors(target.querySelectorAll("a"))
    },
    error: (error) => {
      if (component) {
        component.$destroy();
      }
      switch (error.type) {
        case "MiddlewareError": {
          switch (error.details.status) {
            case 401: {
              component = new E401({ target });
              break;
            }
            case 503: {
              component = new E503({ target });
              break;
            }
            default: {
              component = new E500({ target });
            }
          }
          break;
        }
        case "NotFoundError": {
          component = new E404({ target });
          break;
        }
      }
    }
  });

  router.goTo(`${pathname}${search}`, state);
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

function setAnchors(nodes: NodeListOf<HTMLAnchorElement>): void {
  nodes.forEach(function (href) {
    href.addEventListener("click", function (event) {
      const target = href.getAttribute("href");
      if (isRelative(target)) {
        event.preventDefault();
        router.goTo(target);
      }
    })
  })
}

function isRelative(url: string): boolean {
  return url.indexOf("http") !== 0 || window.location.host === url.replace("http://", "").replace("https://", "").split("/")[0];
}

/*
 |--------------------------------------------------------------------------------
 | Main
 |--------------------------------------------------------------------------------
 */

async function main() {
  await loadTenant("toolkit"); // TODO load this conditionally once resolved via auth

  domain.set("EventStore", new EventStore());

  socket.connect();

  await Promise.all([import("./Subscribers")]);

  route();
}

main();
