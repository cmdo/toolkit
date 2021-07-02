<script lang="ts">
  import type { Category } from "../../../Docs/Types";
  import Section from "./Section.svelte";

  export let category: Category;
</script>

<li>
  {category.name}
  <ul>
    {#each category.sections as section}
      <Section {section} />
    {/each}
  </ul>
</li>