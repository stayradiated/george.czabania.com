import { assertOk } from "@stayradiated/error-boundary"
import { createFactory } from "test-fixture-factory"

import type { DB } from "#lib/types.js"

import { randomULID } from "#lib/utils/ulid.js"

import { deleteUser } from "#lib/db/user/delete-user.js"
import { insertUser } from "#lib/db/user/insert-user.js"

const userFactory = createFactory("User")
  .withContext<{
    db: DB
  }>()
  .withSchema((f) => ({
    db: f.type<DB>().from("db"),
  }))
  .withValue(async ({ db }) => {
    const user = await insertUser({
      db,
      user: {
        id: randomULID(),
        name: "Test User",
        email: "test@example.com",
        image: null,
      },
    })
    assertOk(user)

    return {
      value: user,
      destroy: async () => {
        await deleteUser({ db, userId: user.id })
      },
    }
  })

const useCreateUser = userFactory.useCreateValue
const useUser = userFactory.useValue

export { useCreateUser, useUser }
