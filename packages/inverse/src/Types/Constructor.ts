export type Constructor<T> = {
  new (...args: any[]): T;
};

export type ConstructorArgs<T> = T extends new (...args: infer U) => any ? U : never;
