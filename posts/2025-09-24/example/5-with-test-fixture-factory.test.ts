import { test as baseTest, expect } from "vitest";

import { getNextPublicIdForDocument } from "#lib/db/document/get-next-public-id-for-document.js";

import { useDb } from "#lib/test/use-db.js";
import { useCreateDocument } from "#lib/test/use-document.js";
import { useUser } from "#lib/test/use-user.js";
import { useWorkspace } from "#lib/test/use-workspace.js";

const test = baseTest.extend({
  db: useDb(),
  workspace: useWorkspace(),
  user: useUser(),
  createDocument: useCreateDocument(),
});

test("initial public ID should be 1", async ({ db, workspace }) => {
  const publicId = await getNextPublicIdForDocument({
    db,
    workspaceId: workspace.id,
  });

  expect(publicId).toBe(1);
});

test("should return the next public ID", async ({
  db,
  workspace,
  createDocument,
}) => {
  await createDocument({ publicId: 7 });

  const publicId = await getNextPublicIdForDocument({
    db,
    workspaceId: workspace.id,
  });

  expect(publicId).toBe(8);
});
