export type Tokens = {
  [token: string]: Token;
};

export type Token<C = unknown, T = unknown> = {
  ctor: C;
  type: T;
};
