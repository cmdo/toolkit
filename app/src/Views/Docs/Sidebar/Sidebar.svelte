<script lang="ts">
  import type { Category as CategoryType } from "../../../Docs/Types";
  import Category from "./Category.svelte";

  export let categories: CategoryType[] = [];
</script>

<div id="sidebar">
  <ul>
    {#each categories as category}
      <Category {category} />
    {/each}
  </ul>
</div>

<style>
  #sidebar {
    grid-area: sidebar;
    box-shadow: -1px 0 0 0 var(--sidebar-border-color) inset;
  }

  ul {
    margin: 0;
    padding: 0;
  }
</style>