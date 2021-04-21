export type Packages = Map<string, Package>;

export type Package = {
  type: Type;
  name: string;
  version: string;
  description: string;
  path: string;
};

export type Type = "replica" | "module";
