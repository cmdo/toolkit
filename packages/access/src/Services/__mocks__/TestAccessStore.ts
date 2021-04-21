import { container } from "../../Container";
import { AccessGrantOperation, AccessGrantsData } from "../../Types";
import { AccessStore } from "../AccessStore";

export const store: { [id: string]: AccessGrantsData } = {};

class TestAccessStore implements AccessStore {
  public async setGrants(id: string, acid: string, operations: AccessGrantOperation[]): Promise<void> {
    const grants = await this.getGrants(id);

    for (const operation of operations) {
      switch (operation.type) {
        case "set": {
          assign(grants, acid, operation.resource, operation.action, operation.data);
          break;
        }
        case "unset": {
          remove(grants, acid, operation.resource, operation.action);
          break;
        }
      }
    }

    store[id] = grants;
  }

  public async getGrants(id: string): Promise<AccessGrantsData> {
    if (store[id]) {
      return JSON.parse(JSON.stringify(store[id]));
    }
    return {};
  }
}

function assign(grants: AccessGrantsData, acid: string, resource: string, action: string, data: any): void {
  if (!grants[acid]) {
    grants[acid] = {};
  }
  if (!grants[acid][resource]) {
    grants[acid][resource] = {};
  }
  grants[acid][resource][action] = data;
}

function remove(grants: AccessGrantsData, acid: string, resource: string, action?: string): void {
  if (action) {
    delete grants[acid][resource][action];
  } else {
    delete grants[acid][resource];
  }
}

container.set("AccessStore", new TestAccessStore());
