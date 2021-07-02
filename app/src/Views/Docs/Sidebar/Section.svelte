<script lang="ts">
  import type { Section } from "../../../Docs/Types";
  import { toHashQuery } from "../../../Utils/String";

  export let section: Section;
</script>

<li>
  <a href={`/docs#${toHashQuery(section.name)}`}>{section.name}</a>
</li>

<style>
  a {
    font-weight: 500;
    color: var(--link-color);
    text-decoration: none;
  }

  a:hover {
    color: var(--link-color-hover);
  }
</style>