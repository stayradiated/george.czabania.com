import { test as baseTest, expect } from "vitest"

import { useDb } from "#lib/test/use-db.js"

const test = baseTest.extend({
  db: useDb(),
})

test("should have a db instance", async ({ db }) => {
  // we can use the db instance directly
  const users = await db.selectFrom("users").selectAll().execute()
  expect(users.length).toBe(0)
})
