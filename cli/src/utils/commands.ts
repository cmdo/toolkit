import inquirer from "inquirer";

import { getConfig } from "./package";

export async function getSetupTargets() {
  return inquirer
    .prompt({
      type: "checkbox",
      name: "targets",
      message: "Which platforms do you wish to set up?",
      choices: getConfig().platforms
    })
    .then(({ targets }) => targets);
}
