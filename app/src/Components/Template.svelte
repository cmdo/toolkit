<script lang="ts">
  import Content from "./Content.svelte";
  import Sidebar from "./Sidebar.svelte";

  export let title: string;
</script>

<Sidebar />
<Content {title}>
  <slot />
</Content>