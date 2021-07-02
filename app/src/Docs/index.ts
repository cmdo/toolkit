import { stream } from "./Sections/Stream";
import { user } from "./Sections/User";
import type { Category } from "./Types";

export const categories: Category[] = [
  {
    name: "Domains",
    sections: [user]
  },
  {
    name: "API",
    sections: [stream]
  }
];
