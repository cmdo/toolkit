<script lang="ts">
  import { router } from "./router";

  function handleClick() {
    router.goTo("/");
  }
</script>

<main>
	<button on:click={handleClick}>Home</button>
</main>