import { assertOk } from "@stayradiated/error-boundary"
import { createFactory } from "test-fixture-factory"

import type { UserId, WorkspaceId } from "#lib/ids.js"
import type { DB, User, Workspace } from "#lib/types.js"

import { DocumentStatus } from "#lib/enums.js"
import { genId } from "#lib/utils/gen-id.js"

import { deleteDocument } from "#lib/db/document/delete-document.js"
import { insertDocument } from "#lib/db/document/insert-document.js"

const documentFactory = createFactory("Document")
  .withContext<{
    db: DB
    workspace: Workspace
    user: User
  }>()
  .withSchema((field) => ({
    db: field.type<DB>().from("db"),
    workspaceId: field.type<WorkspaceId>().from("workspace", (ctx) => ctx.workspace.id),
    userId: field.type<UserId>().from("user", (ctx) => ctx.user.id),
    publicId: field.type<number>().default(1),
  }))
  .withValue(async ({ db, workspaceId, userId, publicId }) => {
    const document = await insertDocument({
      db,
      document: {
        id: genId(),
        workspaceId,
        createdByUserId: userId,
        status: DocumentStatus.ACTIVE,
        lastModifiedAt: Date.now(),
        version: 1,
        title: "Test Document",
        ownedByTeamId: null,
        vcsTagList: [],
        archivedAt: null,
        archivedByUserId: null,
        releasedAt: null,
        ownedByPersonId: null,

        // pass through attrs
        publicId,
      },
    })
    assertOk(document)

    return {
      value: document,
      destroy: async () => {
        await deleteDocument({ db, documentId: document.id })
      },
    }
  })

const useCreateDocument = documentFactory.useCreateValue
const useDocument = documentFactory.useValue

export { useCreateDocument, useDocument }
