<script lang="ts">
  import { router } from "./router";

  function handleClick() {
    router.goTo("/about");
  }

  function handleRedirect() {
    router.goTo("/external");
  }
</script>

<main>
	<button on:click={handleClick}>About</button>
  <button on:click={handleRedirect}>External</button>
</main>