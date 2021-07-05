#!/usr/bin/env node

import { Command } from "commander";

import { docker } from "./utils/docker";
import { getList } from "./utils/list";
import { npm } from "./utils/npm";
import { getPackagesByTarget, getSortedPackages } from "./utils/package";

const pkg = require("../package.json");

const program = new Command();

program.version(pkg.version);

program
  .command("setup [target]")
  .description("run setup operations on the current project")
  .action(async (target?: string) => {
    const packages = await getPackagesByTarget(target, "Which packages do you wish to set up?");
    for (const pkg of getSortedPackages(packages)) {
      await npm.install(pkg.path);
      if (pkg.type === "module" || pkg.type === "shared") {
        await npm.compile(pkg.path);
      }
    }
  });

program
  .command("clean [target]")
  .description("clean up project files")
  .action(async (target?: string) => {
    const packages = await getPackagesByTarget(target, "Which packages do you wish to clean up?");
    for (const pkg of getSortedPackages(packages)) {
      switch (pkg.type) {
        case "shared":
        case "module": {
          npm.clean(pkg.path);
          break;
        }
      }
    }
  });

program
  .command("dev")
  .description("start instances for project development")
  .action(async () => {
    const packages = await getPackagesByTarget("all", "Which packages do you wish to start?");

    if (await docker.hasComposeFile()) {
      await docker.compose.up();
      process.on("SIGINT", function () {
        docker.compose.down();
      });
    }

    for (const pkg of getSortedPackages(packages)) {
      switch (pkg.type) {
        case "replica": {
          npm.dev(pkg.path);
          break;
        }
        case "shared": {
          npm.watch(pkg.path);
          break;
        }
      }
    }
  });

program
  .command("docker [action]")
  .description("run docker compose command")
  .action(async (action: "up" | "down") => {
    switch (action) {
      case "up": {
        await docker.compose.up();
        break;
      }
      case "down": {
        await docker.compose.down();
        break;
      }
      default: {
        console.log("Unknown docker command");
      }
    }
  });

program
  .command("list")
  .description("list all cmdo supported packages")
  .action(() => {
    getList().then(console.log);
  });

program.parse(process.argv);
