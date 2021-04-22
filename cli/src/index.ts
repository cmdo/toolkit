#!/usr/bin/env node

import { Command } from "commander";
import Table from "terminal-table";

import { Package } from "./types";
import { docker } from "./utils/docker";
import { npm } from "./utils/npm";
import { getPackages, getPackagesByTarget } from "./utils/package";

const pkg = require("../package.json");

const program = new Command();

program.version(pkg.version);

program
  .command("setup [target]")
  .description("run setup operations on the current project")
  .action(async (target?: string) => {
    const packages = await getPackagesByTarget(target, "Which packages do you wish to set up?");
    for (const pkg of packages) {
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
    for (const pkg of packages) {
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

    for (const pkg of packages) {
      switch (pkg.type) {
        case "replica": {
          npm.dev(pkg.path);
          break;
        }
        case "module":
        case "shared": {
          npm.watch(pkg.path);
          break;
        }
      }
    }
  });

program
  .command("toolkit [target]")
  .description("start instances for toolkit development")
  .option("--docker", "spin up docker")
  .action(async (target: string | undefined, options: any) => {
    const packages = await getPackagesByTarget(target, "Which packages do you wish to start?");

    if (options.docker && (await docker.hasComposeFile())) {
      await docker.compose.up();
      process.on("SIGINT", function () {
        docker.compose.down();
      });
    }

    for (const pkg of packages) {
      switch (pkg.type) {
        case "replica": {
          npm.dev(pkg.path);
          break;
        }
        case "module":
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
  .command("list [type]")
  .description("list all cmdo supported packages")
  .action(async () => {
    const list = Array.from((await getPackages()).values());
    const table = new Table({
      borderStyle: 1,
      horizontalLine: true,
      rightPadding: 1,
      leftPadding: 1
    });

    table.push(["Type", "Name", "Version", "Published"]);

    const replicas: Package[] = [];
    const shared: Package[] = [];
    const modules: Package[] = [];

    for (const pkg of list) {
      switch (pkg.type) {
        case "replica": {
          replicas.push(pkg);
          break;
        }
        case "shared": {
          shared.push(pkg);
          break;
        }
        case "module": {
          modules.push(pkg);
          break;
        }
      }
    }

    for (const pkg of replicas) {
      table.push([pkg.type, pkg.name, pkg.version]);
    }

    for (const pkg of shared) {
      table.push([pkg.type, pkg.name, pkg.version]);
    }

    for (const pkg of modules) {
      table.push([pkg.type, pkg.name, pkg.version, await npm.published.version(pkg.name)]);
    }

    console.log(table.toString());
  });

program.parse(process.argv);
