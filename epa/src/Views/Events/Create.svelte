<script lang="ts">
  import Select from "../../Components/Select.svelte";
  import CreateUser from "./Forms/CreateUser.svelte";
  import SetUserEmail from "./Forms/SetUserEmail.svelte";
  import SetUserName from "./Forms/SetUserName.svelte";

  const list = [{
    title: "CreateUser"
  }, {
    title: "SetUserName"
  }, {
    title: "SetUserEmail"
  }];

  let selected: string | undefined;

  function handleSelect(value?: string) {
    selected = value;
  }
</script>

<style>
  .container {
    max-width: 360px;
  }
</style>

<div class="container flex-shrink h-full p-2 pl-4 pr-4 bg-gray-100 border-solid border-gray-600">
  <Select empty="Select Command" {list} onSelect={handleSelect} />
  {#if selected === "CreateUser"}
    <CreateUser />
  {:else if selected === "SetUserName"}
    <SetUserName />
  {:else if selected === "SetUserEmail"}
    <SetUserEmail />
  {/if}
</div>