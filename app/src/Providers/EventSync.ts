import { getLogicalId } from "cmdo-events";
import { nanoid } from "nanoid";
import type { EventDescriptor } from "shared";
import { events } from "shared";

import { getCollection } from "../Lib/Database/Utils";
import { socket } from "../Lib/Socket";
import { publisher } from "../Providers/EventPublisher";
import { bowser } from "../Utils/Bowser";
import { orderByLocalId } from "../Utils/Sort";

type Store = {
  deviceId: string;
  tenants: Tenants;
};

type Tenants = {
  [tenant: string]: {
    [origin: string]: string;
  };
};

/*
 |--------------------------------------------------------------------------------
 | Synchronization
 |--------------------------------------------------------------------------------
 */

//#region

export const sync = new (class EventSync {
  public readonly deviceId: string;
  public tenants: Tenants;

  constructor() {
    const { deviceId, tenants } = getStore();
    this.deviceId = deviceId;
    this.tenants = tenants;
  }

  /*
   |--------------------------------------------------------------------------------
   | Event Listeners
   |--------------------------------------------------------------------------------
   */

  //#region

  public on(tenantId: string) {
    socket.join(tenantId);
    socket.on("EventAdded", onEventAdded);
  }

  public off(tenantId: string) {
    socket.leave(tenantId);
    socket.off("EventAdded", onEventAdded);
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Utilities
   |--------------------------------------------------------------------------------
   */

  //#region

  public async refresh(tenantId: string, origin = "api") {
    const events = await this.getQueuedEvents(tenantId);
    socket
      .post("SyncEvents", {
        tenantId,
        streamId: "main",
        localId: this.getTenantOriginId(tenantId, origin),
        events
      })
      .then((data) => {
        console.log(data);
        if (data.events.length > 0) {
          for (const descriptor of data.events) {
            addEvent(tenantId, descriptor);
          }
        }
        if (data.localId) {
          this.setTenantOriginID(tenantId, origin, data.localId);
        }
      })
      .catch(console.log);
  }

  public async getQueuedEvents(tenantId: string): Promise<EventDescriptor[]> {
    const { originId } = await socket.post("GetLastKnownDeviceID", { tenantId, deviceId: this.deviceId });
    return getCollection(tenantId, "events")
      .find({ "event.localId": { $gt: originId ?? "" } })
      .sort(orderByLocalId)
      .map((event) => {
        delete event.$loki;
        return event;
      });
  }

  //#endregion

  /*
   |--------------------------------------------------------------------------------
   | Tracking IDs
   |--------------------------------------------------------------------------------
   */

  //#region

  private setTenantOriginID(tenantId: string, origin: string, localId: string) {
    if (!this.tenants[tenantId]) {
      this.tenants[tenantId] = {};
    }
    this.tenants[tenantId][origin] = localId;
    updateStore(this.deviceId, this.tenants);
  }

  private getTenantOriginId(tenantId: string, origin: string): string | undefined {
    return this.tenants[tenantId]?.[origin];
  }

  //#endregion
})();

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Event Handlers
 |--------------------------------------------------------------------------------
 */

//#region

function onEventAdded({ tenantId }) {
  console.log("Event Added", tenantId);
  sync.refresh(tenantId);
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

//#region

function addEvent(tenantId: string, remote: EventDescriptor) {
  const collection = getCollection(tenantId, "events");

  const count = collection.count({ "event.originId": remote.event.originId });
  if (count > 0) {
    console.log("Sync Violation: Event already exists, skipping insertion.");
    return;
  }

  try {
    const local = collection.insertOne({
      ...remote,
      event: {
        ...remote.event,
        localId: getLogicalId()
      }
    });
    if (local) {
      publisher.publish(new events[local.event.type](local.event.data, local.event.localId, local.event.originId).decrypt("sample"));
    }
  } catch (error) {
    console.log("Sync Violation: Failed to insert provided event", error);
  }
}

//#endregion

/*
 |--------------------------------------------------------------------------------
 | Sync Storage
 |--------------------------------------------------------------------------------
 */

//#region

function createStore(): Store {
  const store = {
    deviceId: `${nanoid(6)}-${bowser.getBrowserName().toLowerCase()}`,
    tenants: {}
  };
  localStorage.setItem("sync", JSON.stringify(store));
  return store;
}

function getStore(): Store {
  const stored = localStorage.getItem("sync");
  if (stored) {
    return JSON.parse(stored);
  }
  return createStore();
}

function updateStore(deviceId: string, tenants: Tenants) {
  localStorage.setItem("sync", JSON.stringify({ deviceId, tenants }));
}

//#endregion
