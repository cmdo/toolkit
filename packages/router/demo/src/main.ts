import "./routes";

import type { SvelteComponent } from "svelte";

import { router } from "./router";

const { pathname, search, state } = router.history.location;
let component: SvelteComponent | undefined;
router
  .listen({
    render: async route => {
      if (component) {
        component.$destroy();
      }
      component = new route.components[0]({ target: document.body });
    },
    error: err => {
      console.error(err);
    }
  })
  .goTo(`${pathname}${search}`, state);
