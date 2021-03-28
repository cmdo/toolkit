<script lang="ts">
  import Online from "../../Components/Icons/Online.svelte";
  import Refresh from "../../Components/Icons/Refresh.svelte";

  export let title: string;
</script>

<!-- section body top nav -->
<nav aria-label="top bar" class="flex-none flex justify-between bg-gray-50 h-16">
  <!-- top bar left -->
  <div aria-label="top bar left" aria-orientation="horizontal" class="flex">
    <header aria-label="page caption" class="flex-none flex h-16 border-t px-4 items-center">
      <h1 id="page-caption" class="font-semibold text-lg">{title}</h1>
    </header>
  </div>

  <!-- to bar right  -->
  <ul aria-label="top bar right" aria-orientation="horizontal" class="px-8 flex items-center">
    <li class="h-10 flex items-center">
      <Refresh />
      <Online />
      <span class="ml-3">Kodemon [ Logout ]</span>
      <button title="Page Menu" aria-label="page menu" class="h-full w-10 ml-3 rounded-full border focus:outline-none focus:shadow-outline">
        <img class="h-full w-full rounded-full mx-auto" src="https://avatars.githubusercontent.com/u/1998130?s=400&u=52eee9b7bca8fbeb28e4a8a4a65ccc30d3b8dbf3&v=4" />
      </button>
    </li>
  </ul>
</nav>