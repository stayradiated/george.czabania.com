import { expect, test } from "vitest";

import { getNextPublicIdForDocument } from "#lib/db/document/get-next-public-id-for-document.js";

// @ts-expect-error: db & workspace are not yet defined
test("initial public ID should be 1", async ({ db, workspace }) => {
  const publicId = await getNextPublicIdForDocument({
    db,
    workspaceId: workspace.id,
  });

  expect(publicId).toBe(1);
});

// @ts-expect-error: db & workspace are not yet defined
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
