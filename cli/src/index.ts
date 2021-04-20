#!/usr/bin/env node

import { Command } from "commander";

import { getSetupTargets } from "./utils/commands";
import { getConfig } from "./utils/package";
import { setup } from "./utils/setup";
import { start } from "./utils/start";

const pkg = require("../package.json");

const program = new Command();

program.version(pkg.version);

program
  .command("setup [target]")
  .description("run setup operations on the current project")
  .action(async (target?: string) => {
    try {
      const config = getConfig();
      if (!target) {
        const targets = await getSetupTargets();
        for (const target of targets) {
          await setup(target);
        }
      } else if (!config.platforms.includes(target)) {
        throw new Error(`Platform Violation: '${target}' is not a valid target.`);
      } else {
        await setup(target);
      }
    } catch (error) {
      console.log(error.message);
    }
  });

program
  .command("start [target]")
  .description("run setup operations on the current project")
  .action(async (target?: string) => {
    try {
      const config = getConfig();
      if (!target) {
        const targets = await getSetupTargets();
        for (const target of targets) {
          start(target);
        }
      } else if (!config.platforms.includes(target)) {
        throw new Error(`Platform Violation: '${target}' is not a valid target.`);
      } else {
        await start(target);
      }
    } catch (error) {
      console.log(error.message);
    }
  });

program.parse(process.argv);
