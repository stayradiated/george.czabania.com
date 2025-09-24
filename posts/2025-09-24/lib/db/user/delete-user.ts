import type { UserId } from "#lib/ids.js"
import type { DB } from "#lib/types.js"

export const deleteUser = async (_options: {
  db: DB
  userId: UserId
}): Promise<void | Error> => {
  throw new Error("Not implemented")
}
