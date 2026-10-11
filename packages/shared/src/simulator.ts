export type CommandKey =
  | "status"
  | "add"
  | "commit"
  | "log"
  | "diff"
  | "branch"
  | "switch"
  | "checkout"
  | "merge"
  | "fetch"
  | "pull"
  | "push";
export type CommandCategory =
  "SETUP" | "INSPECT" | "STAGE" | "COMMIT" | "BRANCH" | "MERGE" | "REMOTE";
export type Branch = {
  name: string;
  commitId: string | null;
  upstream: { remoteName: string; branchName: string } | null;
};
export type Commit = {
  id: string;
  message: string;
  parentIds: string[];
  snapshot: Record<string, string>;
};
export type WorkingFileState = {
  path: string;
  content: string;
  status: "untracked" | "modified" | "deleted" | "conflicted";
};
export type StagedFileState = {
  path: string;
  content: string;
  status: "added" | "modified" | "deleted" | "resolved";
};
export type RemoteBranch = { name: string; commitId: string | null };
export type RemoteRepository = {
  name: string;
  branches: RemoteBranch[];
  commits: Commit[];
};
export type RemoteTrackingBranch = {
  remoteName: string;
  branchName: string;
  commitId: string | null;
};
export type MergeState = {
  sourceBranch: string;
  targetBranch: string;
  conflictedPaths: string[];
};
export type RepositoryState = {
  currentBranch: string;
  headCommitId: string | null;
  branches: Branch[];
  commits: Commit[];
  workingTree: WorkingFileState[];
  stagingArea: StagedFileState[];
  remotes: RemoteRepository[];
  remoteTrackingBranches: RemoteTrackingBranch[];
  mergeState: MergeState | null;
  nextCommitSequence: number;
};
export type ParsedCommand = {
  key: CommandKey | "help";
  args: string[];
  options: Record<string, string | boolean>;
  raw: string;
};
export type SimulatorErrorCode =
  | "UNKNOWN_COMMAND"
  | "INVALID_ARGUMENT"
  | "BRANCH_NOT_FOUND"
  | "BRANCH_ALREADY_EXISTS"
  | "NOTHING_TO_COMMIT"
  | "NOTHING_STAGED"
  | "MERGE_CONFLICT"
  | "MERGE_IN_PROGRESS"
  | "REMOTE_NOT_FOUND"
  | "NON_FAST_FORWARD"
  | "NO_UPSTREAM"
  | "INVALID_STATE";
export type SimulatorEvent =
  | { type: "COMMAND_EXECUTED"; commandKey: CommandKey }
  | { type: "BRANCH_CREATED" | "BRANCH_SWITCHED"; branchName: string }
  | { type: "COMMIT_CREATED"; commitId: string; message: string }
  | { type: "MERGE_STARTED"; sourceBranch: string; targetBranch: string }
  | { type: "MERGE_CONFLICT_CREATED" | "CONFLICT_RESOLVED"; paths: string[] }
  | { type: "MERGE_COMPLETED"; commitId?: string }
  | { type: "REMOTE_FETCHED"; remoteName: string }
  | {
      type: "REMOTE_PUSHED" | "REMOTE_PULLED";
      remoteName: string;
      branchName: string;
    };
export type SimulatorResult = {
  success: boolean;
  nextState: RepositoryState;
  output: string;
  errorCode?: SimulatorErrorCode;
  events: SimulatorEvent[];
};
export type FileDiff = {
  path: string;
  before: string | null;
  after: string | null;
  kind: "ADDED" | "MODIFIED" | "DELETED";
};
export type SimulatorCondition =
  | { type: "CURRENT_BRANCH" | "BRANCH_EXISTS"; branchName: string }
  | {
      type: "COMMIT_EXISTS";
      messageContains?: string;
      messageEquals?: string;
      containsPath?: string;
      branchName?: string;
    }
  | { type: "COMMIT_REACHABLE"; commitId: string; branchName: string }
  | {
      type: "STAGED_FILES";
      files: { path: string; status: StagedFileState["status"] }[];
    }
  | { type: "FILE_STAGED" | "FILE_CONFLICTED"; path: string }
  | { type: "MERGE_COMPLETED" }
  | { type: "REMOTE_SYNCED"; remoteName: string; branchName: string };
export type RemoteCommitSpec = {
  remoteName: string;
  branchName: string;
  message: string;
  snapshot: Record<string, string>;
};
