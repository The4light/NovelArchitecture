import { createContext } from "react";
export const StickyContext = createContext({ records: [], upsert: () => {} });
