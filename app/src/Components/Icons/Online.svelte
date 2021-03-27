<script lang="ts">
  import { socket } from "../../Lib/Socket";

  let isOnline = socket.connected;

  socket.on("connected", () => {
    isOnline = true;
  });

  socket.on("disconnected", () => {
    isOnline = false;
  })

  function toggle() {
    if (isOnline) {
      socket.disconnect();
    } else {
      socket.connect();
    }
  }
</script>

<style>
  svg {
    display: inline-block;
    height: 17px;
    width: 17px;
  }

  svg:hover {
    cursor: pointer;
  }

  .online {
    color: green;
  }

  .offline {
    color: gray;
  }
</style>

{#if isOnline}
<svg class="online" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" on:click={toggle}>
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
</svg>
{:else}
<svg class="offline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" on:click={toggle}>
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
</svg>
{/if}