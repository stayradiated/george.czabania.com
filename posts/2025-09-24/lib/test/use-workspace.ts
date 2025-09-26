import { assertOk } from "@stayradiated/error-boundary"
import { createFactory } from "test-fixture-factory"

import type { DB } from "#lib/types.js"

import { WorkspaceStatus } from "#lib/enums.js"
import { randomULID } from "#lib/utils/ulid.js"

import { deleteWorkspace } from "#lib/db/workspace/delete-workspace.js"
import { insertWorkspace } from "#lib/db/workspace/insert-workspace.js"

const workspaceFactory = createFactory("Workspace")
  .withContext<{
    db: DB
  }>()
  .withSchema((field) => ({
    db: field.type<DB>().from("db"),
  }))
  .withValue(async ({ db }) => {
    const workspace = await insertWorkspace({
      db,
      workspace: {
        id: randomULID(),
        icon: "😃",
        name: "Worky McWorkspace",
        status: WorkspaceStatus.ACTIVE,
        publicId: `test:${randomULID()}`,
        version: 1,
        icp: "",
        strategy: "",
        vision: "",
        deletedAt: null,
      },
    })
    assertOk(workspace)

    return {
      value: workspace,
      destroy: async () => {
        await deleteWorkspace({ db, workspaceId: workspace.id })
      },
    }
  })

const useCreateWorkspace = workspaceFactory.useCreateValue
const useWorkspace = workspaceFactory.useValue

export { useCreateWorkspace, useWorkspace }
