<script lang="ts">
  export let list: { title: string }[] = [];
  export let empty = "Select ...";
  export let current = empty;
  export let onSelect: (value?: string) => void;
  
  let show = false;
  let active = false;

  function setActive() {
    active = true;
  }

  function setInactive() {
    active = false;
  }
  
  function toggle() {
    setTimeout(() => {
      show = !show;
    }, 20)
  }
  
  function clear() {
    if (current !== empty) {
      current = empty;
      onSelect();
    }
    if (show) {
      show = false;
    }
  }
  
  function select(value: string) {
    return function () {
      current = value;
      toggle();
      onSelect(value);
    }
  }

  window.addEventListener("click", () => {
    if (!active && show) {
      show = false;
    }
  })
</script>

<style>
  .select {
    cursor: pointer;
  }
  .top-100 {
    top: 100%;
  }
  .bottom-100 {
    bottom: 100%;
  }
  .max-h-select {
    max-height: 300px;
  }
</style>

<div class="flex-auto flex flex-col items-center mb-3" on:mouseenter={setActive} on:mouseleave={setInactive}>
  <div class="flex flex-col items-center relative w-full">
    <div class="w-full">
      <div class="my-2 bg-white p-1 flex border border-gray-200 rounded">
        <button on:click={toggle} class={`select p-1 px-2 appearance-none w-full text-left ${current === empty ? "text-gray-400" : "text-gray-800"}`}>{current}</button>
        <div>
          <button class="cursor-pointer w-6 h-full flex items-center text-gray-400 button:" on:click={clear}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200">
          <button class="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none" on:click={toggle}>
            {#if show}
              <svg class="feather feather-chevron-up w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            {:else}
              <svg class="feather feather-chevron-up w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>
    {#if show}
      <div class="absolute shadow top-100 z-40 w-full lef-0 rounded max-h-select overflow-y-auto">
        <div class="flex flex-col w-full">
          {#each list as entry}
            <div class="cursor-pointer w-full border-gray-100 rounded-t border-b hover:bg-teal-100" on:click={select(entry.title)}>
              <div class="flex w-full items-center p-2 pl-2 border-transparent bg-white border-l-2 relative hover:bg-teal-600 hover:text-teal-100 hover:border-teal-600">
                <div class="w-full items-center flex">
                  <div class="mx-2 leading-6">{entry.title}</div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>