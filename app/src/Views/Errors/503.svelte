<script lang="ts">
  import { router } from "cmdo-router";

  function home() {
    router.goTo("/");
  }
</script>

<div class="md:flex min-h-screen">
  <div class="w-full md:w-1/2 bg-white flex items-center justify-center ">
    <div class="max-w-sm m-8">
      <div class="text-black text-5xl md:text-15xl font-black">503</div>
      <div class="w-16 h-1 bg-purple-light my-3 md:my-6" />
      <p class="text-grey-darker text-2xl md:text-3xl font-light mb-8 leading-normal">Sorry, our servers are down.</p>
      <button class="bg-transparent text-grey-darkest font-bold uppercase tracking-wide py-3 px-6 border-2 border-grey-light hover:border-grey rounded-lg" on:click={home}
        >Go Home</button
      >
    </div>
  </div>
  <div class="relative pb-full md:flex md:pb-0 md:min-h-screen w-full md:w-1/2">
    <div style="background-image: url('/503-illustration.svg');" class="absolute top-0 right-0 bottom-0 left-0 pin bg-cover bg-no-repeat md:bg-left lg:bg-center" />
  </div>
</div>
