<script lang="ts">
  import { router } from "./router";

  let progress = 0;

  router.on("progress", value => {
    progress = value;
  });

  function handleClick() {
    router.goTo("/about?foo=bar");
  }

  function handleRedirect() {
    router.goTo("/external");
  }
</script>

<main>
  {progress}
	<button on:click={handleClick}>About</button>
  <button on:click={handleRedirect}>External</button>
</main>