import type { DB, Workspace } from "#lib/types.js"

export const insertWorkspace = async (options: {
  db: DB
  workspace: Workspace
}): Promise<Workspace | Error> => {
  return options.workspace
}
