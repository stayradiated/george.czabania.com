import { assertOk } from "@stayradiated/error-boundary";
import { expect, test } from "vitest";
import { deleteDocument } from "#lib/db/document/delete-document.js";
import { getNextPublicIdForDocument } from "#lib/db/document/get-next-public-id-for-document.js";
import { insertDocument } from "#lib/db/document/insert-document.js";
import { getDb } from "#lib/db/get-db.js";
import { deleteUser } from "#lib/db/user/delete-user.js";
import { insertUser } from "#lib/db/user/insert-user.js";
import { deleteWorkspace } from "#lib/db/workspace/delete-workspace.js";
import { insertWorkspace } from "#lib/db/workspace/insert-workspace.js";
import { DocumentStatus, WorkspaceStatus } from "#lib/enums.js";
import { randomULID } from "#lib/utils/ulid.js";

test("initial public ID should be 1", async () => {
  // SETUP
  const db = getDb();
  const workspace = await insertWorkspace({
    db,
    workspace: {
      id: randomULID(),
      icon: "😀",
      name: "Worky McWorkspace",
      status: WorkspaceStatus.ACTIVE,
      publicId: `test:${randomULID()}`,
      version: 1,
      icp: "",
      strategy: "",
      vision: "",
      deletedAt: null,
    },
  });
  assertOk(workspace);

  // TEST
  const publicId = await getNextPublicIdForDocument({
    db,
    workspaceId: workspace.id,
  });

  expect(publicId).toBe(1);

  // TEARDOWN
  await deleteWorkspace({ db, workspaceId: workspace.id });
});

test("should return the next public ID", async () => {
  // SETUP
  const db = getDb();
  const workspace = await insertWorkspace({
    db,
    workspace: {
      id: randomULID(),
      icon: "😀",
      name: "Worky McWorkspace",
      status: WorkspaceStatus.ACTIVE,
      publicId: `test:${randomULID()}`,
      version: 1,
      icp: "",
      strategy: "",
      vision: "",
      deletedAt: null,
    },
  });
  assertOk(workspace);

  const user = await insertUser({
    db,
    user: {
      id: randomULID(),
      name: "Test User",
      email: "test@example.com",
      image: null,
    },
  });
  assertOk(user);

  const document = await insertDocument({
    db,
    document: {
      id: randomULID(),
      workspaceId: workspace.id,
      version: 1,
      status: DocumentStatus.ACTIVE,
      createdByUserId: user.id,
      lastModifiedAt: Date.now(),
      title: "Test Document",
      ownedByTeamId: null,
      vcsTagList: [],
      archivedAt: null,
      archivedByUserId: null,
      releasedAt: null,
      ownedByPersonId: null,

      // NOTE: the value of this publicId impacts the test result
      publicId: 7,
    },
  });
  assertOk(document);

  // TEST
  const publicId = await getNextPublicIdForDocument({
    db,
    workspaceId: workspace.id,
  });

  expect(publicId).toBe(8);

  // TEARDOWN
  await deleteDocument({ db, documentId: document.id });
  await deleteUser({ db, userId: user.id });
  await deleteWorkspace({ db, workspaceId: workspace.id });
});
