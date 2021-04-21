<script lang="ts">
  import { User } from "../Models/User";

  import Template from "./Template/Template.svelte";

  let users = User.observe();
</script>

<Template title="Data">
  <pre class="p-4">{JSON.stringify($users, null, 2)}</pre>
</Template>
