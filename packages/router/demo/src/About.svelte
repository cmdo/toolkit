<script lang="ts">
  import { router } from "./router";

  let progress = 0;

  router.on("progress", value => {
    progress = value;
  });

  function handleClick() {
    router.goTo("/");
  }
</script>

<main>
  {progress}
	<button on:click={handleClick}>Home</button>
</main>