#!/usr/bin/env node

import { Command } from "commander";
import Table from "terminal-table";

import { Package } from "./types";
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
      if (pkg.type === "module") {
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
        case "module": {
          npm.clean(pkg.path);
          break;
        }
      }
    }
  });

program
  .command("start [target]")
  .description("start production instances for the given projects")
  .action(async (target?: string) => {
    const packages = await getPackagesByTarget(target, "Which packages do you wish to start?");
    for (const pkg of packages) {
      switch (pkg.type) {
        case "replica": {
          npm.start(pkg.path);
          break;
        }
      }
    }
  });

program
  .command("dev [target]")
  .description("start development instances for the given projects")
  .action(async (target?: string) => {
    const packages = await getPackagesByTarget(target, "Which packages do you wish to start?");
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
