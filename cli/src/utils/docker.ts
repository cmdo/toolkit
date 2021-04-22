import { spawn } from "child_process";
import fs from "fs";

export const docker = {
  async hasComposeFile() {
    return new Promise((resolve) => {
      fs.access("./docker-compose.yml", fs.constants.F_OK, function (err) {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },

  compose: {
    async up() {
      const cursor = spawn("docker-compose", ["up", "-d"], { stdio: "inherit" });
      return new Promise((resolve, reject) => {
        cursor.on("close", resolve);
        cursor.on("error", reject);
      });
    },

    async down() {
      const cursor = spawn("docker-compose", ["down"], { stdio: "inherit" });
      return new Promise((resolve, reject) => {
        cursor.on("close", resolve);
        cursor.on("error", reject);
      });
    }
  }
};
