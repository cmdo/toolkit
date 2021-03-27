/* eslint-disable */

import { LokiOps } from "lokijs";

/**
 * Match query against given record.
 *
 * @param query  - Loki query.
 * @param record - Record to validate.
 *
 * @returns Match result.
 */
export function match(query: LokiQuery<any>, record: any): boolean {
  const filters = [];

  let property: any;
  let queryOp: any;
  let operator: any;
  let value: any;

  for (const key in query) {
    const obj: any = {};

    obj[key] = query[key];

    filters.push(obj);

    if (query.hasOwnProperty(key)) {
      property = key;
      queryOp = query[key];
    }
  }

  // if more than one expression in single query object,
  // convert implicit $and to explicit $and

  if (filters.length > 1) {
    return match({ $and: filters }, record);
  }

  // injecting $and and $or expression tree evaluation here.

  switch (property) {
    case "$and": {
      return matchAnd(queryOp, record);
    }
    case "$or": {
      return matchOr(queryOp, record);
    }
  }

  // see if query object is in shorthand mode (assuming eq operator)

  if (queryOp === null || typeof queryOp !== "object" || queryOp instanceof Date) {
    operator = "$eq";
    value = queryOp;
  } else if (typeof queryOp === "object") {
    for (const key in queryOp) {
      if (queryOp[key]) {
        operator = key;
        value = queryOp[key];
        break;
      }
    }
  } else {
    throw new Error("Do not know what you want to do.");
  }

  if (operator === "$regex" || typeof value === "object") {
    value = precompileQuery(operator, value);
  }

  // if user is deep querying the object such as find('name.first': 'odin')

  const usingDotNotation = property.indexOf(".") !== -1;

  // the comparison function

  const fun = (LokiOps as any)[operator];

  if (usingDotNotation) {
    property = property.split(".");
    if (dotSubScan(record, property, fun, value, record)) {
      return true;
    }
  } else {
    if (fun(record[property], value, record)) {
      return true;
    }
  }

  return false;
}

/**
 * Match every expression provided.
 *
 * @param expressions - Expressions to validate.
 * @param record      - Record to validate.
 *
 * @returns Validation result.
 */
function matchAnd(expressions: LokiQuery<any>[], record: any): boolean {
  for (var i = 0, len = expressions.length; i < len; i++) {
    if (!match(expressions[i], record)) {
      return false;
    }
  }
  return true;
}

/**
 * Match one of the expressions provided.
 *
 * @param expressions - Expressions to validate.
 * @param record      - Record to validate.
 *
 * @returns Validation result.
 */
function matchOr(expressions: LokiQuery<any>[], record: any): boolean {
  for (var i = 0, len = expressions.length; i < len; i++) {
    if (match(expressions[i], record)) {
      return true;
    }
  }
  return false;
}

/**
 *
 * @param operator
 * @param value
 */
function precompileQuery(operator: any, value: any) {
  // for regex ops, precompile
  if (operator === "$regex") {
    if (Array.isArray(value)) {
      value = new RegExp(value[0], value[1]);
    } else if (!(value instanceof RegExp)) {
      value = new RegExp(value);
    }
  } else if (typeof value === "object") {
    for (var key in value) {
      if (key === "$regex" || typeof value[key] === "object") {
        value[key] = precompileQuery(key, value[key]);
      }
    }
  }

  return value;
}

/**
 * Helper function used for dot notation queries.
 *
 * @param root    - Object to traverse.
 * @param paths   - Array of properties to drill into.
 * @param fun     - Evaluation function to test with.
 * @param value   - Comparative value to also pass to (compare) fun.
 * @param extra   - Extra arg to also pass to compare fun.
 * @param pOffset - Index of the item in 'paths' to start the sub-scan from.
 *
 * @returns Scan result.
 */
function dotSubScan(root: Record<string, any>, paths: string[], fun: Function, value: any, extra: any, pOffset: number = 0): boolean {
  const path = paths[pOffset];

  let valueFound = false;

  let element;
  if (typeof root === "object" && path in root) {
    element = root[path];
  }

  if (pOffset + 1 >= paths.length) {
    // if we have already expanded out the dot notation,
    // then just evaluate the test function and value on the element
    valueFound = fun(element, value, extra);
  } else if (Array.isArray(element)) {
    for (var index = 0, len = element.length; index < len; index += 1) {
      valueFound = dotSubScan(element[index], paths, fun, value, extra, pOffset + 1);
      if (valueFound === true) {
        break;
      }
    }
  } else {
    valueFound = dotSubScan(element, paths, fun, value, extra, pOffset + 1);
  }

  return valueFound;
}
