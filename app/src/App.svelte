<script lang="ts">
  import { onMount } from "svelte";
  
  import { addRouteListener } from "./Providers/Route";
  import { setup } from "./Setup";
  
  let component;

  onMount(async () => {
    await setup();
    addRouteListener((nextComponent) => {
      component = nextComponent;
    });
  });
</script>

{#if component}
  <svelte:component this={component} />
{/if}