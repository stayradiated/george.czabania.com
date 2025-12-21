import { test as baseTest } from "vitest";

import { useDb } from "#lib/test/use-db.js";
import { useWorkspace } from "#lib/test/use-workspace.js";

const test = baseTest.extend({
  db: useDb(),
  workspace: useWorkspace(),
});

test("should have a workspace instance", async ({ workspace }) => {
  console.log(workspace.id); // "…A5361"
});

test("should have a different workspace instance", async ({ workspace }) => {
  console.log(workspace.id); // "…B4215"
});
