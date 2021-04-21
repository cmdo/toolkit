<script lang="ts">
  export let label: string;
  export let name: string;
  export let type: svelte.JSX.HTMLAttributes<HTMLInputElement>["type"];
  export let value: string;

  function handleInput(e) {
    value = e.target.value;
  }
</script>

<style>
  label {
    top: 0%;
    transform: translateY(-50%);
    font-size: 11px;
    color: rgba(37, 99, 235, 1);
  }

  .empty input:not(:focus) + label {
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
  }

  input:not(:focus) + label {
    color: rgba(70, 70, 70, 1);
  }

  input {
    border-width: 1px;
  }

  input:focus {
    outline: none;
    border-color: rgba(37, 99, 235, 1);
  }
</style>

<div class="relative h-10 input-component mb-5">
  <input
    id={name}
    class="h-full w-full border-gray-300 px-2 transition-all border-blue rounded-sm"
    {type}
    {name}
    {value}
    on:input={handleInput}
  />
  <label for={name} class="absolute left-2 transition-all px-1">
    {label}
  </label>
</div>
