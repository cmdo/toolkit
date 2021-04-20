import path from "path";

export function isValidProject(): boolean {
  try {
    return getConfig() !== undefined;
  } catch (err) {
    return false;
  }
}

export function getConfig() {
  return getPackage().cmdo;
}

function getPackage() {
  try {
    return require(path.resolve("./package.json"));
  } catch (err) {
    throw new Error("Project Violation: Could not locate package.json in current directory.");
  }
}
