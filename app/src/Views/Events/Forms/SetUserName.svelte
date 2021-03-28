<script lang="ts">
  import Input from "../../../Components/Input.svelte";
  import { handle } from "../../../Domains/User/CommandHandlers";
  import { SetUserName } from "../../../Domains/User/Commands/SetUserName";

  let id = "";
  let name = "";

  function submit() {
    handle(new SetUserName(id, name))
      .then(() => {
        name = "";
      }).catch(console.log);
  }
</script>

<form on:submit|preventDefault={submit}>
  <Input label="ID" type="text" name="id" bind:value={id} />
  <Input label="Name" type="text" name="name" bind:value={name} />
  <div class="flex justify-center align-middle">
    <button type="submit" class="bg-white text-gray-800 font-bold rounded border-b-2 border-green-500 hover:border-green-600 hover:bg-green-500 hover:text-white shadow-md py-2 px-6 inline-flex items-center">
      <span class="mr-2">Submit</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
      </svg>
    </button>
  </div>
</form>