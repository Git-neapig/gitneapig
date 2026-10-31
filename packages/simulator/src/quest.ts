import type {
  CommandKey,
  QuestCondition,
  QuestDefinition,
  QuestRuntimeState,
  RepositoryState,
  SimulatorEvent,
  TeamMessage,
} from "@gitneapig/shared";
import { executeCommand } from "./engine";
import {
  applyRemoteCommit,
  evaluateCondition,
  modifyWorkingFile,
} from "./state";
import { fail } from "./parser";

export type QuestAttempt = {
  repository: RepositoryState;
  collaboration: QuestRuntimeState;
  messages: TeamMessage[];
  events: SimulatorEvent[];
  firedEventIds: string[];
  completedObjectiveIds: string[];
  activeObjectiveId: string | null;
};
export function evaluateQuestCondition(
  attempt: QuestAttempt,
  condition: QuestCondition,
): boolean {
  switch (condition.type) {
    case "SIMULATOR_EVENT_OCCURRED":
      return attempt.events.some((e) => e.type === condition.eventType);
    case "PULL_REQUEST_OPENED":
      return attempt.collaboration.pullRequests.some(
        (pr) =>
          (!condition.pullRequestId || pr.id === condition.pullRequestId) &&
          ["OPEN", "CHANGES_REQUESTED", "APPROVED"].includes(pr.status),
      );
    case "REVIEW_RESOLVED":
      return attempt.collaboration.reviews.some(
        (r) =>
          (!condition.reviewId || r.id === condition.reviewId) &&
          ["RESOLVED", "APPROVED"].includes(r.status),
      );
    case "ISSUE_DONE":
      return attempt.collaboration.issues.some(
        (i) =>
          (!condition.issueId || i.id === condition.issueId) &&
          i.status === "DONE",
      );
    default:
      return evaluateCondition(attempt.repository, condition);
  }
}
export function questCompleted(
  definition: QuestDefinition,
  attempt: QuestAttempt,
): boolean {
  return (
    definition.objectives.every((o) =>
      attempt.completedObjectiveIds.includes(o.id),
    ) &&
    definition.successConditions.every((c) =>
      evaluateQuestCondition(attempt, c),
    )
  );
}
export function advanceQuest(
  definition: QuestDefinition,
  previous: QuestAttempt,
  trigger: {
    start?: boolean;
    commandKey?: CommandKey;
    events?: SimulatorEvent[];
  } = {},
): QuestAttempt {
  const next = structuredClone(previous);
  next.events.push(...(trigger.events ?? []));
  // Each event fires at most once. A bounded fixed point lets one event unlock another.
  for (let pass = 0; pass <= definition.events.length; pass++) {
    let changed = false;
    for (const event of definition.events) {
      if (next.firedEventIds.includes(event.id)) continue;
      const matches =
        event.trigger === "QUEST_START"
          ? trigger.start
          : event.trigger === "AFTER_COMMAND"
            ? !!trigger.commandKey && trigger.commandKey === event.commandKey
            : event.trigger === "AFTER_SIMULATOR_EVENT"
              ? (trigger.events ?? []).some(
                  (e) => e.type === event.simulatorEventType,
                )
              : !!event.condition &&
                evaluateQuestCondition(next, event.condition);
      if (!matches) continue;
      next.firedEventIds.push(event.id);
      changed = true;
      for (const action of event.actions) {
        switch (action.type) {
          case "ADD_MESSAGE":
            next.messages.push(action.message);
            break;
          case "APPLY_REMOTE_COMMIT":
            next.repository = applyRemoteCommit(
              next.repository,
              action.remoteCommit,
            );
            break;
          case "MODIFY_WORKING_FILE":
            next.repository = modifyWorkingFile(
              next.repository,
              action.path,
              action.content,
            );
            break;
          case "ENABLE_PULL_REQUEST":
            if (
              !next.collaboration.pullRequests.some(
                (p) => p.id === action.pullRequestId,
              )
            )
              next.collaboration.pullRequests.push({
                id: action.pullRequestId,
                sourceBranch: next.repository.currentBranch,
                targetBranch: "main",
                status: "AVAILABLE",
              });
            break;
          case "OPEN_REVIEW": {
            const pr = next.collaboration.pullRequests.find(
              (p) => p.status === "OPEN",
            );
            if (!pr)
              fail("INVALID_STATE", "Review requires an open pull request.");
            if (
              !next.collaboration.reviews.some((r) => r.id === action.reviewId)
            )
              next.collaboration.reviews.push({
                id: action.reviewId,
                pullRequestId: pr.id,
                status: "PENDING",
              });
            break;
          }
          case "UPDATE_REVIEW": {
            const review = next.collaboration.reviews.find(
              (r) => r.id === action.reviewId,
            );
            if (!review) fail("INVALID_STATE", "Review is missing.");
            review.status = action.status;
            break;
          }
          case "UPDATE_ISSUE": {
            const issue = next.collaboration.issues.find(
              (i) => i.id === action.issueId,
            );
            if (issue) issue.status = action.status;
            else
              next.collaboration.issues.push({
                id: action.issueId,
                status: action.status,
              });
            break;
          }
          case "UPDATE_OBJECTIVE":
            next.activeObjectiveId = action.objectiveId;
            break;
        }
      }
    }
    for (const objective of definition.objectives) {
      if (
        !next.completedObjectiveIds.includes(objective.id) &&
        objective.conditions.every((c) => evaluateQuestCondition(next, c))
      )
        next.completedObjectiveIds.push(objective.id);
    }
    if (!changed) break;
  }
  next.activeObjectiveId =
    definition.objectives.find(
      (o) => !next.completedObjectiveIds.includes(o.id),
    )?.id ?? null;
  return next;
}
export function startQuest(definition: QuestDefinition): QuestAttempt {
  return advanceQuest(
    definition,
    {
      repository: structuredClone(definition.initialState),
      collaboration: {
        pullRequests: [],
        reviews: [],
        issues: [{ id: "issue-1", status: "OPEN" }],
      },
      messages: [],
      events: [],
      firedEventIds: [],
      completedObjectiveIds: [],
      activeObjectiveId: definition.objectives[0]?.id ?? null,
    },
    { start: true },
  );
}
export function executeQuestCommand(
  definition: QuestDefinition,
  previous: QuestAttempt,
  command: string,
) {
  const result = executeCommand(previous.repository, command);
  const executed = result.events.find((e) => e.type === "COMMAND_EXECUTED");
  const attempt = advanceQuest(
    definition,
    { ...previous, repository: result.nextState },
    { commandKey: executed?.commandKey, events: result.events },
  );
  return { attempt, result };
}
export function questCollaborationAction(
  definition: QuestDefinition,
  previous: QuestAttempt,
  action: { type: "OPEN_PR" | "RESOLVE_REVIEW" | "CLOSE_ISSUE"; id: string },
): QuestAttempt {
  const next = structuredClone(previous);
  if (action.type === "OPEN_PR") {
    const pr = next.collaboration.pullRequests.find(
      (p) => p.id === action.id && p.status === "AVAILABLE",
    );
    if (!pr) fail("INVALID_ARGUMENT", "Pull request is not available.");
    pr.status = "OPEN";
  } else if (action.type === "RESOLVE_REVIEW") {
    const review = next.collaboration.reviews.find(
      (r) => r.id === action.id && r.status === "PENDING",
    );
    if (!review)
      fail("INVALID_ARGUMENT", "Review is not awaiting acknowledgement.");
    review.status = "RESOLVED";
    const pr = next.collaboration.pullRequests.find(
      (p) => p.id === review.pullRequestId,
    );
    if (pr) pr.status = "APPROVED";
  } else {
    const issue = next.collaboration.issues.find((i) => i.id === action.id);
    if (!issue) fail("INVALID_ARGUMENT", "Issue does not exist.");
    const remaining = definition.objectives.filter(
      (o) => !o.conditions.some((c) => c.type === "ISSUE_DONE"),
    );
    if (!remaining.every((o) => next.completedObjectiveIds.includes(o.id)))
      fail(
        "INVALID_STATE",
        "Complete the remaining work before closing the issue.",
      );
    issue.status = "DONE";
  }
  return advanceQuest(definition, next);
}
