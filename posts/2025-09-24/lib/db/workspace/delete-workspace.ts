import type { WorkspaceId } from "#lib/ids.js";
import type { DB } from "#lib/types.js";

export const deleteWorkspace = async (_options: {
  db: DB;
  workspaceId: WorkspaceId;
}): Promise<undefined | Error> => {
  return;
};
