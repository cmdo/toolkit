<script lang="ts">
  import { container as events } from "cmdo-events";
  import { onMount } from "svelte";
  
  import { loadTenant } from "./Lib/Database";
  import { socket } from "./Lib/Socket";
  import { origin } from "./Providers/EventOrigin";
  import { router } from "./Router";
  
  import E401 from "./Views/Errors/401.svelte";
  import E404 from "./Views/Errors/404.svelte";
  import E500 from "./Views/Errors/500.svelte";
  import E503 from "./Views/Errors/503.svelte";

  let component;

  const { pathname, search, state } = router.location;

  onMount(async () => {
    events.set("EventOrigin", origin);

    socket.connect();

    await loadTenant("toolkit"); // TODO load tenant conditionally
    
    await Promise.all([import("./Subscribers/User")]);

    router.listen({
      render: async (components) => {
        component = components[0];
      },
      error: (error) => {
        switch (error.type) {
          case "RenderActionMissingError": {
            console.log(error);
            component = E500;
            break;
          }
          case "ActionRejectedError": {
            console.log(error);
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
          case "RouteNotFoundError": {
            console.log(error);
            component = E404;
            break;
          }
        }
      }
    });

    // ### Inital Route

    router.goTo(`${pathname}${search}`, state);
  });
</script>

{#if component}
  <svelte:component this={component} />
{/if}