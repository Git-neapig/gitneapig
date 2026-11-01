import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Circle, LockKeyhole, ArrowRight } from "lucide-react";
import type { QuestDefinition, QuestRuntimeState } from "@gitneapig/shared";
import {
  advanceQuest,
  executeQuestCommand,
  modifyWorkingFile,
  questCollaborationAction,
  questCompleted,
  startQuest,
} from "@gitneapig/simulator";
import { useResource } from "../lib/api";
import { useLocale } from "../lib/i18n";
import { useSession } from "../lib/session";
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
} from "../components/ui";
import { Failure, Loading, PageHeading } from "../components/feedback";
import {
  Completion,
  guestCompleted,
  useCompletion,
} from "../features/learning/completion";
import { ResetButton, Workspace } from "../features/workspace/workspace";
import type { TerminalEntry } from "../features/workspace/use-simulator";
import "./quest-daily-final.css";
type QuestSummary = Pick<
  QuestDefinition,
  "id" | "slug" | "order" | "title" | "summary" | "xpReward" | "unlockRule"
> & { available: boolean; completed: boolean };
export function QuestsPage() {
  const { user, epoch } = useSession(),
    { t, text } = useLocale(),
    resource = useResource<{ items: QuestSummary[] }>("/quests", epoch),
    guest = guestCompleted("quests");
  return (
    <>
      <PageHeading title={t("quests")} description={t("questDescription")} />
      {!user ? <Alert>{t("guestNote")}</Alert> : null}
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Failure error={resource.error} retry={resource.refresh} />
      ) : (
        <div className="quest-list">
          {resource.data?.items.map((quest) => {
            const available = user
                ? quest.available
                : !quest.unlockRule.prerequisiteQuestId ||
                  guest.includes(quest.unlockRule.prerequisiteQuestId),
              done = user ? quest.completed : guest.includes(quest.id);
            return (
              <Card
                key={quest.id}
                variant={!available ? "locked" : done ? "success" : "default"}
              >
                <div className="actions">
                  <span className="quest-number">
                    {String(quest.order).padStart(2, "0")}
                  </span>
                  <Badge
                    tone={done ? "success" : available ? "primary" : "locked"}
                  >
                    {t(done ? "completed" : available ? "available" : "locked")}
                  </Badge>
                  <span className="muted">{quest.xpReward} XP</span>
                </div>
                <h2>
                  {available ? (
                    <Link className="card-link" to={`/quests/${quest.slug}`}>
                      {text(quest.title)}
                    </Link>
                  ) : (
                    text(quest.title)
                  )}
                </h2>
                <p className="muted">{text(quest.summary)}</p>
                {available ? (
                  <ArrowRight size={18} />
                ) : (
                  <span className="locked-note">
                    <LockKeyhole size={16} />
                    {t("prereq")}
                  </span>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
export function QuestPage() {
  const { slug } = useParams(),
    { user, epoch } = useSession(),
    { t } = useLocale(),
    resource = useResource<QuestDefinition>(
      `/quests/${encodeURIComponent(slug ?? "")}`,
      epoch,
    ),
    list = useResource<{ items: QuestSummary[] }>("/quests", epoch);
  if (resource.loading || list.loading) return <Loading />;
  if (resource.error)
    return <Failure error={resource.error} retry={resource.refresh} />;
  if (!resource.data) return null;
  if (
    !user &&
    resource.data.unlockRule.prerequisiteQuestId &&
    !guestCompleted("quests").includes(
      resource.data.unlockRule.prerequisiteQuestId,
    )
  )
    return (
      <>
        <Alert tone="warning">{t("prereq")}</Alert>
        <Link className="button" to="/quests">
          {t("quests")}
        </Link>
      </>
    );
  if (list.error) return <Failure error={list.error} retry={list.refresh} />;
  return (
    <QuestRunner
      key={`${resource.data.id}:${user?.id ?? "guest"}`}
      definition={resource.data}
      nextQuest={list.data?.items.find(
        (item) => item.order === resource.data!.order + 1,
      )}
    />
  );
}
function QuestRunner({
  definition,
  nextQuest,
}: {
  definition: QuestDefinition;
  nextQuest?: QuestSummary;
}) {
  const { t, text } = useLocale(),
    [attempt, setAttempt] = useState(() => startQuest(definition)),
    [entries, setEntries] = useState<TerminalEntry[]>([]),
    [hints, setHints] = useState<Record<string, number>>({}),
    [resultView, setResultView] = useState(false),
    [attemptNumber, setAttemptNumber] = useState(0),
    [error, setError] = useState<unknown>(null);
  const record = useCompletion("quests", definition.id),
    transitioned = useRef(-1);
  const chat = useRef<HTMLDivElement>(null),
    followChat = useRef(true);
  const [newMessages, setNewMessages] = useState(false);
  const complete = questCompleted(definition, attempt),
    { save } = record;
  useEffect(() => {
    if (!complete || transitioned.current === attemptNumber) return;
    transitioned.current = attemptNumber;
    setResultView(true);
    void save();
  }, [complete, attemptNumber, save]);
  useEffect(() => {
    if (followChat.current && chat.current)
      chat.current.scrollTop = chat.current.scrollHeight;
    else setNewMessages(true);
  }, [attempt.messages.length]);
  function run(command: string) {
    if (complete) return;
    if (command.trim() === "hint") {
      const objective = definition.objectives.find(
        (item) => item.id === attempt.activeObjectiveId,
      );
      if (!objective?.hints) return;
      const count = hints[objective.id] ?? 0;
      if (count < 3) {
        const person = definition.team[0];
        let message = objective.hints[count];
        const targetBranch = objective.conditions.find(
          (condition) => condition.type === "CURRENT_BRANCH",
        );
        if (
          count === 2 &&
          targetBranch?.type === "CURRENT_BRANCH" &&
          attempt.repository.branches.some(
            (branch) => branch.name === targetBranch.branchName,
          )
        ) {
          const command = `git switch ${targetBranch.branchName}`;
          message = {
            ko: `브랜치가 이미 있습니다. 생성하지 않고 이동하세요.\n${command}`,
            en: `The branch already exists. Switch without creating it.\n${command}`,
            ja: `ブランチは既存です。作成せず切り替えます。\n${command}`,
          };
        }
        setAttempt((previous) => ({
          ...previous,
          messages: [
            ...previous.messages,
            {
              id: `hint:${objective.id}:${count}`,
              speakerName: person.name,
              avatarKey: person.avatarKey,
              message: {
                ko: `${message.ko} (${count + 1}/3)`,
                en: `${message.en} (${count + 1}/3)`,
                ja: `${message.ja} (${count + 1}/3)`,
              },
              role: person.role,
            },
          ],
        }));
        setHints((previous) => ({ ...previous, [objective.id]: count + 1 }));
      }
      setEntries((previous) =>
        [
          ...previous,
          {
            command,
            output: t(count < 3 ? "hintSent" : "allHintsShown"),
            success: true,
          },
        ].slice(-500),
      );
      return;
    }
    const next = executeQuestCommand(definition, attempt, command);
    setAttempt(next.attempt);
    setEntries((previous) =>
      [
        ...previous,
        { command, output: next.result.output, success: next.result.success },
      ].slice(-500),
    );
  }
  function edit(path: string, content: string | null) {
    if (complete) return;
    const repository = modifyWorkingFile(attempt.repository, path, content);
    setAttempt(advanceQuest(definition, { ...attempt, repository }));
  }
  function reset() {
    followChat.current = true;
    setNewMessages(false);
    setAttempt(startQuest(definition));
    setEntries([]);
    setHints({});
    setResultView(false);
    setAttemptNumber((previous) => previous + 1);
    setError(null);
  }
  function action(
    type: "OPEN_PR" | "RESOLVE_REVIEW" | "CLOSE_ISSUE",
    id: string,
  ) {
    try {
      if (complete) return;
      setAttempt(questCollaborationAction(definition, attempt, { type, id }));
      setError(null);
    } catch (error) {
      setError(error);
    }
  }
  if (resultView)
    return (
      <div className="quest-result-final">
        <Breadcrumb
          items={[
            { label: t("quests"), to: "/quests" },
            { label: text(definition.title) },
          ]}
        />
        <progress
          className="quest-result-progress"
          value={100}
          max={100}
          aria-label={t("completed")}
        />
        <p className="quest-result-percentage">
          {t("completed")} <span>100%</span>
        </p>
        <div className="quest-result-center">
          <h1>
            {text({
              ko: "퀘스트 완료!",
              en: "Quest Complete!",
              ja: "クエスト完了！",
            })}
          </h1>
          <p>
            {text({
              ko: `${text(definition.title)}의 모든 목표를 완료했습니다.`,
              en: `You completed all objectives for ${text(definition.title)}.`,
              ja: `${text(definition.title)}のすべての目標を達成しました。`,
            })}
          </p>
          <Completion record={record} passed={complete} />
        </div>
        {nextQuest ? (
          <section className="quest-up-next">
            <span>{t("nextQuest")}</span>
            <div>
              <h2>{text(nextQuest.title)}</h2>
              <p>{text(nextQuest.summary)}</p>
            </div>
          </section>
        ) : null}
        <div className="lesson-navigation">
          <Button onClick={() => setResultView(false)}>{t("back")}</Button>
          {nextQuest ? (
            record.result ? (
              <Link
                className="button button-primary"
                to={`/quests/${nextQuest.slug}`}
              >
                {t("nextQuest")}
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Button disabled>{t("nextQuest")}</Button>
            )
          ) : (
            <Link className="button button-primary" to="/quests">
              {t("backToQuests")}
            </Link>
          )}
        </div>
      </div>
    );
  return (
    <>
      <Breadcrumb
        items={[
          { label: t("quests"), to: "/quests" },
          { label: text(definition.title) },
        ]}
      />
      <PageHeading
        title={text(definition.title)}
        actions={
          <div className="actions">
            <ResetButton reset={reset} />
          </div>
        }
      />
      <p className="muted quest-story">{text(definition.story)}</p>
      <div className="quest-workspace">
        <aside className="quest-team">
          <h2>{t("team")}</h2>
          <div className="teammate-row">
            {definition.team.map((person) => (
              <Avatar
                key={person.id}
                src={`/mascots/characters/${person.avatarKey}/avatar.png`}
                alt={`${person.name} · ${text(person.role)}`}
              />
            ))}
          </div>
          {newMessages ? (
            <Button
              size="sm"
              onClick={() => {
                if (chat.current)
                  chat.current.scrollTop = chat.current.scrollHeight;
                followChat.current = true;
                setNewMessages(false);
              }}
            >
              {t("newMessages")}
            </Button>
          ) : null}
          <div
            ref={chat}
            className="team-messages"
            role="log"
            aria-live="polite"
            aria-label={t("team")}
            onScroll={() => {
              if (chat.current) {
                followChat.current =
                  chat.current.scrollHeight -
                    chat.current.scrollTop -
                    chat.current.clientHeight <
                  32;
                if (followChat.current) setNewMessages(false);
              }
            }}
          >
            {attempt.messages.map((message) => (
              <div key={message.id} className="message">
                <Avatar
                  size="sm"
                  src={`/mascots/characters/${message.avatarKey}/avatar.png`}
                  alt={message.speakerName}
                />
                <div>
                  <strong>{message.speakerName}</strong>
                  {message.role ? (
                    <small className="teammate-role">
                      {text(message.role)}
                    </small>
                  ) : null}
                  <p>{text(message.message)}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="quest-center">
          <Workspace
            key={attemptNumber}
            state={attempt.repository}
            entries={entries}
            onRun={run}
            onEdit={edit}
            readOnly={complete}
          />
        </div>
        <aside className="quest-objectives">
          <h2>{t("objectives")}</h2>
          <ol className="objective-list">
            {definition.objectives.map((objective) => {
              const done = attempt.completedObjectiveIds.includes(objective.id);
              return (
                <li key={objective.id} className={done ? "is-complete" : ""}>
                  {done ? <Check size={18} /> : <Circle size={16} />}
                  <div>
                    <strong>{text(objective.title)}</strong>
                    <p>{text(objective.description)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <Collaboration state={attempt.collaboration} action={action} />
          <p className="quest-hint-guidance">
            {text({
              ko: "터미널에 hint를 입력하면 현재 목표의 힌트를 볼 수 있습니다. 목표마다 3단계 힌트가 제공됩니다.",
              en: "Type hint in the terminal for the current objective. Each objective has three levels of hints.",
              ja: "ターミナルにhintと入力すると現在の目標のヒントが表示されます。目標ごとに3段階のヒントがあります。",
            })}
          </p>
        </aside>
      </div>
      {error ? <Failure error={error} /> : null}
      {complete ? (
        <Button onClick={() => setResultView(true)}>{t("RESULT")}</Button>
      ) : null}
      {record.error ? <Completion record={record} passed /> : null}
    </>
  );
}
function Collaboration({
  state,
  action,
}: {
  state: QuestRuntimeState;
  action: (
    type: "OPEN_PR" | "RESOLVE_REVIEW" | "CLOSE_ISSUE",
    id: string,
  ) => void;
}) {
  const { t } = useLocale();
  return (
    <section className="collaboration">
      {state.pullRequests.map((pr) => (
        <div key={pr.id}>
          <p>
            <code>
              {pr.sourceBranch} → {pr.targetBranch}
            </code>
          </p>
          {pr.status === "AVAILABLE" ? (
            <Button size="sm" onClick={() => action("OPEN_PR", pr.id)}>
              {t("openPr")}
            </Button>
          ) : (
            <Badge tone="info">{t(pr.status)}</Badge>
          )}
        </div>
      ))}
      {state.reviews
        .filter((review) => review.status === "PENDING")
        .map((review) => (
          <Button
            key={review.id}
            size="sm"
            onClick={() => action("RESOLVE_REVIEW", review.id)}
          >
            {t("resolveReview")}
          </Button>
        ))}
      {state.issues
        .filter((issue) => issue.status === "OPEN")
        .map((issue) => (
          <Button
            key={issue.id}
            size="sm"
            onClick={() => action("CLOSE_ISSUE", issue.id)}
          >
            {t("closeIssue")}
          </Button>
        ))}
    </section>
  );
}
