<script lang="ts">
  import { container as domain } from "cmdo-events";
  import { router } from "cmdo-router";
  import { onMount } from "svelte";

  import { loadTenant } from "./Lib/Database";
  import { socket } from "./Lib/Socket";
  import { EventStore } from "./Providers/EventStore";

  import E401 from "./Views/Errors/401.svelte";
  import E404 from "./Views/Errors/404.svelte";
  import E500 from "./Views/Errors/500.svelte";
  import E503 from "./Views/Errors/503.svelte";

  let component;

  const { pathname, search, state } = router.location;

  onMount(async () => {
    domain.set("EventStore", new EventStore());
    socket.connect();

    await loadTenant("toolkit"); // TODO load tenant conditionally

    await Promise.all([import("./Subscribers")]);

    router.listen({
      render: async (route) => {
        component = route.components[0];
      },
      error: (error) => {
        switch (error.type) {
          case "MiddlewareError": {
            switch (error.details.status) {
              case 401: {
                component = E401;
                break;
              }
              case 503: {
                component = E503;
                break;
              }
              default: {
                component = E500;
              }
            }
            break;
          }
          case "NotFoundError": {
            component = E404;
            break;
          }
        }
      }
    });

    router.goTo(`${pathname}${search}`, state);
  });
</script>

{#if component}
  <svelte:component this={component} />
{/if}