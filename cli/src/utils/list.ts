import Table from "terminal-table";

import { Package } from "../types";
import { getPackages, getSortedPackages } from "./package";

const config = {
  borderStyle: 1,
  horizontalLine: true,
  rightPadding: 1,
  leftPadding: 1
};

class ListTable {
  public table = new Table(config);

  constructor(packages: Package[] = []) {
    this.setHeader();
    this.setContent(packages);
  }

  private setHeader() {
    this.table.push(["Type", "Name", "Version"]);
  }

  private setContent(packages: Package[]) {
    this.getRows(getSortedPackages(packages)).forEach((row) => this.table.push(row));
  }

  private getRows(packages: Package[], rows: string[][] = []): string[][] {
    const pkg = packages.shift();
    if (!pkg) {
      return rows;
    }
    return this.getRows(packages, [...rows, this.getRow(pkg)]);
  }

  private getRow(pkg: Package): string[] {
    return [pkg.type, pkg.name, pkg.version];
  }

  public toString() {
    return this.table.toString();
  }
}

export async function getList(): Promise<string> {
  return new ListTable(await getPackages(true)).toString();
}
