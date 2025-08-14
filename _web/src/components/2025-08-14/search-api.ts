import { matchSorter } from "match-sorter";

import rawGroceries from "./groceries.txt?raw";

const groceryList = rawGroceries.split("\n").filter(Boolean);

type SearchOptions = {
  delayMs: number;
  query: string;
  signal: AbortSignal;
};

const search = async (options: SearchOptions): Promise<string[]> => {
  const { delayMs, query, signal } = options;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const promise = new Promise<string[]>((resolve) => {
    timeoutId = setTimeout(() => {
      resolve(matchSorter(groceryList, query));
    }, delayMs);
  });

  signal.addEventListener("abort", () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  return promise;
};

export { search };
