import type { DocumentId } from "#lib/ids.js";
import type { DB } from "#lib/types.js";

export const deleteDocument = async (_options: {
  db: DB;
  documentId: DocumentId;
}): Promise<undefined | Error> => {
  throw new Error("Not implemented");
};
