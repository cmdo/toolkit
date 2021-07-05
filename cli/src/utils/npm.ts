import { exec, spawn } from "child_process";

export const npm = {
  /**
   * Run NPM install in the given cwd location.
   *
   * @param cwd - Working directory to run NPM install.
   */
  async install(cwd: string) {
    console.log("CMDO NPM INSTALL", cwd);
    const cursor = spawn("npm", ["i"], { stdio: "inherit", cwd });
    return new Promise((resolve, reject) => {
      cursor.on("close", resolve);
      cursor.on("error", reject);
    });
  },

  /**
   * Run NPM compile in the given cwd location.
   *
   * @param cwd - Working directory to run NPM compile.
   */
  async compile(cwd: string) {
    const cursor = spawn("npm", ["run", "compile"], { stdio: "inherit", cwd });
    return new Promise((resolve, reject) => {
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
    spawn("npm", ["run", "start"], { stdio: "inherit", cwd });
  },

  /**
   * Run npm dev script in the given cwd location.
   *
   * @param cwd - Working directory to run start.
   */
  dev(cwd: string) {
    spawn("npm", ["run", "dev"], { stdio: "inherit", cwd });
  },

  /**
   * Run npm watch script in the given cwd location.
   *
   * @param cwd - Working directory to run watch.
   */
  watch(cwd: string) {
    spawn("npm", ["run", "watch"], { stdio: "inherit", cwd });
  },

  /**
   * Run npm clean script in the given cwd location.
   *
   * @param cwd - Working directory to run start.
   */
  async clean(cwd: string) {
    const cursor = spawn("npm", ["run", "clean"], { stdio: "inherit", cwd });
    return new Promise((resolve, reject) => {
      cursor.on("close", resolve);
      cursor.on("error", reject);
    });
  },

  published: {
    async version(name: string) {
      return new Promise((resolve) => {
        exec(`npm show ${name} version`, (error, stdout) => {
          resolve(error ? "" : stdout.trim());
        });
      });
    }
  },

  link: {
    /**
     * Create a new link for the given package path.
     *
     * @param cwd - Working directory to link.
     */
    async create(cwd: string) {
      const cursor = spawn("npm", ["link"], { stdio: "inherit", cwd });
      return new Promise((resolve, reject) => {
        cursor.on("close", resolve);
        cursor.on("error", reject);
      });
    },

    /**
     * Respøve an existing new link under the given package path with the
     * provided package name to link.
     *
     * @param cwd  - Working directory to add link to.
     * @param name - Package name to link.
     */
    async resolve(cwd: string, name: string) {
      const cursor = spawn("npm", ["link", name], { stdio: "inherit", cwd });
      return new Promise((resolve, reject) => {
        cursor.on("close", resolve);
        cursor.on("error", reject);
      });
    }
  }
};
