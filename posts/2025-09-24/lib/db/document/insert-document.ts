import type { DB, Document } from "#lib/types.js"

export const insertDocument = async (_options: {
  db: DB
  document: Document
}): Promise<Document | Error> => {
  throw new Error("Not implemented")
}
