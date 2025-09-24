import type { DB } from "#lib/types.js"

export const getDb = (): DB => {
  const db: DB = {
    selectFrom: (_table: string) => db,
    selectAll: () => db,
    execute: () => Promise.resolve([]),
  }

  return db
}
