<script lang="ts">
	import { categories } from "../Docs";
	
	import Content from "./Docs/Content/Content.svelte";
	import Sidebar from "./Docs/Sidebar/Sidebar.svelte";
</script>

<main>
	<Sidebar {categories} />
	<Content />
</main>

<style>
	main {
		display: grid;
		grid-template-columns: 220px 1fr;
		grid-template-rows: 1fr;
		grid-template-areas: "sidebar content";

		max-width: 100vw;
		min-height: 100vh;
	}
</style>