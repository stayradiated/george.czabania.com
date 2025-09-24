import { assertOk } from "@stayradiated/error-boundary"
import { test as baseTest, expect } from "vitest"

import type { DB, Document, User, Workspace } from "#lib/types.js"

import { DocumentStatus, WorkspaceStatus } from "#lib/enums.js"
import { genId } from "#lib/utils/gen-id.js"
import { getDb } from "#lib/db/get-db.js"

import { deleteDocument } from "#lib/db/document/delete-document.js"
import { getNextPublicIdForDocument } from "#lib/db/document/get-next-public-id-for-document.js"
import { insertDocument } from "#lib/db/document/insert-document.js"
import { deleteUser } from "#lib/db/user/delete-user.js"
import { insertUser } from "#lib/db/user/insert-user.js"
import { deleteWorkspace } from "#lib/db/workspace/delete-workspace.js"
import { insertWorkspace } from "#lib/db/workspace/insert-workspace.js"

const test = baseTest.extend<{
  db: DB
  workspace: Workspace
  user: User
  createDocument: (attrs: { publicId: number }) => Promise<Document>
}>({
  db: async ({}, use) => {
    const db = getDb()
    await use(db)
  },
  workspace: async ({ db }, use) => {
    const workspace = await insertWorkspace({
      db,
      workspace: {
        id: genId(),
        icon: "😀",
        name: "Worky McWorkspace",
        status: WorkspaceStatus.ACTIVE,
        publicId: `test:${genId()}`,
        version: 1,
        icp: "",
        strategy: "",
        vision: "",
        deletedAt: null,
      },
    })
    assertOk(workspace)
    await use(workspace)
    await deleteWorkspace({ db, workspaceId: workspace.id })
  },
  user: async ({ db }, use) => {
    const user = await insertUser({
      db,
      user: {
        id: genId(),
        name: "Test User",
        email: "test@example.com",
        image: null,
      },
    })
    assertOk(user)
    await use(user)
    await deleteUser({ db, userId: user.id })
  },
  createDocument: async ({ db, user, workspace }, use) => {
    const documentList: Document[] = []
    await use(async (attrs) => {
      const document = await insertDocument({
        db,
        document: {
          id: genId(),
          workspaceId: workspace.id,
          createdByUserId: user.id,
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
          publicId: attrs.publicId,
        },
      })
      assertOk(document)
      documentList.push(document)
      return document
    })
    for (const document of documentList) {
      await deleteDocument({ db, documentId: document.id })
    }
  },
})

test("initial public ID should be 1", async ({ db, workspace }) => {
  const publicId = await getNextPublicIdForDocument({
    db,
    workspaceId: workspace.id,
  })

  expect(publicId).toBe(1)
})

test("should return the next public ID", async ({ db, workspace, createDocument }) => {
  await createDocument({ publicId: 7 })

  const publicId = await getNextPublicIdForDocument({
    db,
    workspaceId: workspace.id,
  })

  expect(publicId).toBe(8)
})
