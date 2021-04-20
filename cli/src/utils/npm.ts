import { spawn } from "child_process";

export const npm = {
  /**
   * Run NPM install in the given cwd location.
   *
   * @param cwd - Working directory to run NPM install.
   */
  async install(cwd: string) {
    const cursor = spawn(`npm`, ["i"], { stdio: "inherit", cwd });
    return new Promise(async (resolve, reject) => {
      cursor.on("close", resolve);
      cursor.on("error", reject);
    });
  },

  /**
   * Run npm start script in the given cwd location.
   *
   * @param cwd - Working directory to run start.
   */
  start(cwd: string) {
    spawn(`npm`, ["run", "start"], { stdio: "inherit", cwd });
  },

  /**
   * Run npm dev script in the given cwd location.
   *
   * @param cwd - Working directory to run start.
   */
  dev(cwd: string) {
    spawn(`npm`, ["run", "dev"], { stdio: "inherit", cwd });
  },

  /**
   * Run npm watch script in the given cwd location.
   *
   * @param cwd - Working directory to run watch.
   */
  watch(cwd: string) {
    spawn(`npm`, ["run", "watch"], { stdio: "inherit", cwd });
  },

  /**
   * Run npm clean script in the given cwd location.
   *
   * @param cwd - Working directory to run start.
   */
  async clean(cwd: string) {
    const cursor = spawn(`npm`, ["run", "clean"], { stdio: "inherit", cwd });
    return new Promise(async (resolve, reject) => {
      cursor.on("close", resolve);
      cursor.on("error", reject);
    });
  }
};
