import type { WorkspaceId } from "#lib/ids.js"
import type { DB } from "#lib/types.js"

export const getNextPublicIdForDocument = async (_options: {
  db: DB
  workspaceId: WorkspaceId
}): Promise<number | Error> => {
  throw new Error("Not implemented")
}
