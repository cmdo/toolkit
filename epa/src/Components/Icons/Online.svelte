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
<svg class="online ml-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" on:click={toggle}>
  <path fill-rule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
</svg>
{:else}
<svg class="offline ml-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" on:click={toggle}>
  <path fill-rule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
</svg>
{/if}