const map: Map<string, any> = new Map();

export const events = {
  /**
   * Add event.
   *
   * @param option
   */
  set(type: string, event: any): void {
    map.set(type, event);
  },

  /**
   * Retrieve event.
   *
   * @param type - Event type.
   *
   * @returns Event or undefined
   */
  get(type: string) {
    return map.get(type);
  }
};
