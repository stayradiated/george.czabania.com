import type { DocumentStatus, WorkspaceStatus } from "#lib/enums.js";
import type {
  DocumentId,
  PersonId,
  TeamId,
  UserId,
  WorkspaceId,
} from "#lib/ids.js";

export type DB = {
  selectFrom: (table: string) => DB;
  selectAll: () => DB;
  execute: () => Promise<unknown[]>;
};

export type Workspace = {
  id: WorkspaceId;
  icon: string;
  name: string;
  status: (typeof WorkspaceStatus)[keyof typeof WorkspaceStatus];
  publicId: string;
  version: number;
  icp: string;
  strategy: string;
  vision: string;
  deletedAt: Date | null;
};

export type Document = {
  workspaceId: WorkspaceId;
  id: DocumentId;
  version: number;
  status: (typeof DocumentStatus)[keyof typeof DocumentStatus];
  createdByUserId: UserId;
  lastModifiedAt: number;
  publicId: number;
  title: string;
  ownedByTeamId: TeamId | null;
  vcsTagList: string[];
  archivedAt: number | null;
  archivedByUserId: UserId | null;
  releasedAt: number | null;
  ownedByPersonId: PersonId | null;
};

export type User = {
  id: UserId;
  name: string;
  email: string;
  image: string | null;
};
