#!/usr/bin/env node

import { Command } from "commander";
import Table from "terminal-table";

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
    }
  });

program
  .command("clean [target]")
  .description("clean up project files")
  .action(async (target?: string) => {
    console.log(await getPackagesByTarget(target, "Which packages do you wish to clean up?"));
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
        case "module": {
          npm.watch(pkg.path);
          break;
        }
      }
    }
  });

program
  .command("list [type]")
  .description("list all cmdo supported packages")
  .action(async (type?: "module" | "replica") => {
    const list = Array.from((await getPackages()).values());
    const table = new Table({
      borderStyle: 2,
      horizontalLine: true,
      rightPadding: 1,
      leftPadding: 1,
      width: [9, "50%", 18]
    });
    table.push(["Type", "Name", "Version"]);
    for (const pkg of list) {
      table.push([pkg.type, pkg.name, pkg.version]);
    }
    console.log(table.toString());
  });

program.parse(process.argv);
