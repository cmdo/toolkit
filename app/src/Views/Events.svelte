<script>
  import Template from "./Template/Template.svelte";
  import Create from "./Events/Create.svelte";
  import List from "./Events/List.svelte";
</script>

<Template title="Events">
  <div class="flex flex-auto">
    <Create />
    <List />
  </div>
</Template>