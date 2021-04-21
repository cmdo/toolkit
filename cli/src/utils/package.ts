import glob from "glob";
import inquirer from "inquirer";
import path from "path";

import type { Package, Packages } from "../types";

/**
 * Generate a list of user selectable packages to perform commands on.
 *
 * @param message - Choice message.
 *
 * @returns Selected packages.
 */
export async function getPackageChoices(message: string): Promise<Package[]> {
  const packages = await getPackages();
  const choices = await inquirer
    .prompt([
      {
        type: "checkbox",
        name: "keys",
        message,
        choices: Array.from(packages.values()).map((pkg) => ({
          name: `${pkg.name} [${pkg.type}]`,
          value: pkg.name
        })),
        loop: false
      }
    ])
    .then(({ keys }) => keys);
  return choices.map((entry: string) => packages.get(entry));
}

export async function getPackagesByTarget(target: string | undefined, message: string) {
  if (!target) {
    return getPackageChoices(message);
  }
  const list = await getPackages(true);
  switch (target) {
    case "replica": {
      return list.filter((pkg) => pkg.type === "replica");
    }
    case "module": {
      return list.filter((pkg) => pkg.type === "module");
    }
    case "all": {
      return list;
    }
  }
  return list.filter((pkg) => pkg.name === target);
}

/**
 * Map all packages with cmdo details from the current location.
 *
 * @param toArray - Return the packages as an array.
 *
 * @returns Map of packages.
 */
export async function getPackages(toArray: true): Promise<Package[]>;
export async function getPackages(toArray?: false): Promise<Packages>;
export async function getPackages(toArray = false): Promise<Packages | Package[]> {
  return new Promise<Packages | Package[]>((resolve, reject) => {
    glob(
      "**/package.json",
      {
        ignore: ["**/node_modules/**"]
      },
      (error, files) => {
        if (error) {
          return reject(error);
        }
        const packages: Packages = new Map();
        for (const file of files) {
          const uri = `./${file}`;
          try {
            const pkg = getPackage(uri);
            if (pkg.cmdo !== undefined) {
              packages.set(pkg.name, {
                type: pkg.cmdo.type,
                name: pkg.name,
                version: pkg.version,
                description: pkg.description,
                path: uri.replace("/package.json", "")
              });
            }
          } catch (err) {
            reject(err);
          }
        }
        resolve(toArray ? Array.from(packages.values()) : packages);
      }
    );
  });
}

/**
 * Get package.json content at the given uri.
 *
 * @param uri - URI location of the package.json to read.
 *
 * @returns Package.
 */
function getPackage(uri: string) {
  try {
    return require(path.resolve(uri));
  } catch (err) {
    throw new Error(`Project Violation: Could resolve './${uri}'.`);
  }
}
