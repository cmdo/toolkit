<script lang="ts">
  import { getDate, publisher } from "cmdo-events";
  import { format } from "date-fns";
  
  import Input from "../../Components/Input.svelte";
  import { container } from "../../Container";
import type { EventDescriptor } from "../../Providers/EventStore";
  import { orderByReversedOriginId } from "../../Utils/Sort";

  let search = "";
  let query: any = {};
  
  let descriptors = container.get("TenantStore").getCollection<EventDescriptor>("events").find(query).sort(orderByReversedOriginId);
  
  publisher.on("publish", () => {
    descriptors = container.get("TenantStore").getCollection<EventDescriptor>("events").find(query).sort(orderByReversedOriginId);
  });

  function submit() {
    query = { $or: [] };
    const blocks = search.split(" ");
    for (const block of blocks) {
      const [key, value] = block.split(":");
      if (value !== undefined) {
        query.$or.push({
          [key]: {
            $regex: [value, "gi"]
          }
        });
      }
    }
    descriptors = container.get("TenantStore").getCollection("events").find(query.$or.length > 0 ? query : {}).sort(orderByReversedOriginId);
  }
</script>

<div class="flex-grow h-full bg-gray-50">
  <form class="p-5 pt-4 pb-0 border-b-2" style="height: 65px" on:submit|preventDefault={submit}>
    <Input label="Search" type="text" name="search" bind:value={search} />
  </form>
  <div class="pt-2" style="height: calc(100% - 65px); overflow-x: hidden; overflow-y: scroll;">
    {#each descriptors as event}
      <div class="relative transform scale-100 text-xs py-1 border-b-2 border-gray-100 cursor-default bg-opacity-25">
        <div class="px-6 pb-2 whitespace-no-wrap">
          <div class="leading-5">
            {#each Object.keys(event).filter(v => v !== "$loki") as key, index}
              <div class={`p-1 bg-gray-${index % 2 === 0 ? "50" : "100"}`}>
                <span class="text-purple-400 inline-block" style="width: 100px;">{key}</span> 
                <span class={`text-gray-600 inline-block ${key === "type" ? " font-bold" : ""}`}>{event[key]}</span>
              </div>
            {/each}
            <div class={`p-1 bg-gray-${Object.keys(event).filter(v => v !== "$loki").length % 2 === 0 ? "50" : "100"}`}>
              <span class="text-purple-400 inline-block" style="width: 100px;">created</span> 
              <span class="text-gray-600 inline-block">{format(getDate(event.originId), "PPPP @ pp")}</span>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>