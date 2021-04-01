export const copy = {
  json<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
};
