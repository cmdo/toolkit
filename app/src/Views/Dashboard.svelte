<script lang="ts">
  import { UserCreated } from "shared";
  import type { EventDescriptor } from "shared";

  import { socket } from "../Lib/Socket";
  import { createUser } from "../Actions/User";
  import { sync } from "../Lib/Sync";
  import { getTenantId } from "../Lib/Tenant";

  socket.on("events.add", (data: any) => {
    console.log(data);
  });

  socket.on("chat", ({ message }) => {
    console.log(message);
  })

  function emit() {
    createUser("John Doe", "john.doe@fixture.none");
  }

  function syncDown() {
    sync.getTenantEvents(getTenantId());
  }

  function join() {
    socket.join("chat-1");
  }

  function leave() {
    socket.leave("chat-1");
  }

  function message() {
    socket.post("chat", {
      room: "chat-1",
      message: "Hello World"
    });
  }
</script>

Dashboard <a href="/docs">Go to Docs</a>

<button on:click={emit}>Create User</button>

<button on:click={syncDown}>Sync</button>

<button on:click={join}>Join</button>

<button on:click={leave}>Leave</button>

<button on:click={message}>Message</button>