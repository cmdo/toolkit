<script lang="ts">
  import Navbar from "./Navbar.svelte";

  export let title: string;
</script>

<div class="flex-1 flex flex-col">
  <Navbar {title}  />
  <main class="flex-grow flex min-h-0 border-t overflow-hidden">
    <slot />
  </main>
</div>