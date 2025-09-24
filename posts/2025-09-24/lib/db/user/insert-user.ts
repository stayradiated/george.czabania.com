import type { DB, User } from "#lib/types.js"

export const insertUser = async (_options: {
  db: DB
  user: User
}): Promise<User | Error> => {
  throw new Error("Not implemented")
}
