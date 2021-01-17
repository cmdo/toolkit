/*
 |--------------------------------------------------------------------------------
 | Access Grants Data
 |--------------------------------------------------------------------------------
 */

export type AccessGrantsData = {
  [acid: string]: AccessGrantsResources;
};

export type AccessGrantsResources = {
  [resource: string]: AccessGrantActions;
};

export type AccessGrantActions = {
  [action: string]: any;
};

/*
 |--------------------------------------------------------------------------------
 | Access Grant Operation
 |--------------------------------------------------------------------------------
 */

export type AccessGrantOperation<T = unknown> = AccessGrantSetOperation<T> | AccessGrantUnsetOperation;

type AccessGrantSetOperation<T = unknown> = {
  type: "set";
  resource: string;
  action: string;
  data?: T;
};

type AccessGrantUnsetOperation = {
  type: "unset";
  resource: string;
  action?: string;
};
