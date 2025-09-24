import { createFactory } from "test-fixture-factory"

import { getDb } from "#lib/db/get-db.js"

const dbFactory = createFactory("DB").withValue(() => {
  const db = getDb()

  return {
    value: db,
  }
})

const useDb = dbFactory.useValue

export { useDb }
