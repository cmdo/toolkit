import chalk from "chalk";

import { EventDescriptor } from "../Services/Mongo";

export function log({ tenant, event }: EventDescriptor): void {
  console.log(chalk`\n{bgCyan.bold Event Stored}\n`);
  console.log(chalk`{cyan.bold Tenant}     ${tenant}`);
  console.log(chalk`{cyan.bold Event} ${json(event)}`);
}

function json(obj: any, lead = 0): string {
  let str = "";
  let len = 0;
  for (const key in obj) {
    if (key.length > len) {
      len = key.length;
    }
  }
  for (const key in obj) {
    str += chalk`\n  ${spaces(lead)}{magenta.bold ${key}} ${spaces(len - key.length)} ${
      Array.isArray(obj[key]) ? obj[key].join(",") : typeof obj[key] === "object" && obj[key] !== null ? json(obj[key], lead + 2) : obj[key]
    }`;
  }
  return str;
}

function spaces(len: number): string {
  return Array(len).fill("\xa0").join("");
}
