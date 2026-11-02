import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark as BookmarkIcon,
  BookOpen,
  Flag,
  Terminal,
  ChevronRight,
} from "lucide-react";
import type {
  Bookmark,
  CommandReferenceListItem,
  LessonSummary,
  LocalizedText,
  PaginatedResponse,
  QuestDefinition,
} from "@gitneapig/shared";
import { api, useResource } from "../lib/api";
import { useLocale } from "../lib/i18n";
import { Button, Dialog, IconButton, Pagination } from "../components/ui";
import { Failure, Loading, PageHeading } from "../components/feedback";
export function BookmarksPage() {
  const { t, text } = useLocale(),
    [page, setPage] = useState(1),
    [category, setCategory] = useState<Bookmark["targetType"]>("LESSON"),
    [selected, setSelected] = useState<Bookmark | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const resource = useResource<PaginatedResponse<Bookmark>>(
      `/bookmarks?page=${page}&pageSize=10&targetType=${category}`,
    ),
    lessons = useResource<{ items: LessonSummary[] }>("/lessons"),
    quests = useResource<{
      items: Pick<QuestDefinition, "id" | "slug" | "title">[];
    }>("/quests"),
    commands = useResource<PaginatedResponse<CommandReferenceListItem>>(
      "/reference/commands?pageSize=100",
    );
  const targets = new Map<
    string,
    { label: LocalizedText | string; path: string }
  >();
  for (const lesson of lessons.data?.items ?? [])
    targets.set(`LESSON:${lesson.id}`, {
      label: lesson.title,
      path: `/learn/${lesson.slug}`,
    });
  for (const quest of quests.data?.items ?? [])
    targets.set(`QUEST:${quest.id}`, {
      label: quest.title,
      path: `/quests/${quest.slug}`,
    });
  for (const command of commands.data?.items ?? [])
    targets.set(`COMMAND:${command.id}`, {
      label: command.name,
      path: `/reference/${command.key}`,
    });
  async function remove() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/bookmarks/${selected.id}`, { method: "DELETE" });
      setSelected(null);
      if (resource.data?.items.length === 1 && page > 1) setPage(page - 1);
      else resource.refresh();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading title={t("bookmarks")} />
      <div
        className="bookmark-categories"
        role="group"
        aria-label={t("bookmarks")}
      >
        {(["LESSON", "QUEST", "COMMAND"] as const).map((type) => (
          <Button
            key={type}
            aria-pressed={category === type}
            onClick={() => {
              setCategory(type);
              setPage(1);
            }}
          >
            {t(
              type === "LESSON"
                ? "learn"
                : type === "QUEST"
                  ? "quests"
                  : "reference",
            )}
          </Button>
        ))}
      </div>
      {error ? <Failure error={error} /> : null}
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Failure error={resource.error} retry={resource.refresh} />
      ) : (
        <>
          <div className="bookmark-list">
            {resource.data?.items.map((bookmark) => {
              const target = targets.get(
                `${bookmark.targetType}:${bookmark.targetId}`,
              );
              const Icon =
                bookmark.targetType === "LESSON"
                  ? BookOpen
                  : bookmark.targetType === "QUEST"
                    ? Flag
                    : Terminal;
              return (
                <div className="bookmark-row" key={bookmark.id}>
                  {target ? (
                    <Link
                      to={
                        target.path +
                        (bookmark.targetType === "LESSON"
                          ? `?stage=${bookmark.stage ?? "SITUATION"}`
                          : "")
                      }
                    >
                      <Icon size={24} className="muted" aria-hidden="true" />
                      <span>
                        <strong>
                          {typeof target.label === "string"
                            ? target.label
                            : text(target.label)}
                        </strong>
                        {bookmark.targetType === "LESSON" ? (
                          <small className="muted">
                            {t(bookmark.stage ?? "SITUATION")}
                          </small>
                        ) : null}
                      </span>
                    </Link>
                  ) : (
                    <span>{bookmark.targetId}</span>
                  )}
                  <IconButton
                    label={t("unbookmark")}
                    onClick={() => setSelected(bookmark)}
                  >
                    <BookmarkIcon size={20} fill="currentColor" />
                  </IconButton>
                  <ChevronRight
                    className="muted"
                    size={20}
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>
          {!resource.data?.items.length ? (
            <p className="empty-state muted">{t("nothingYet")}</p>
          ) : null}
          <Pagination
            page={page}
            pages={resource.data?.totalPages ?? 0}
            onChange={setPage}
            previousLabel={t("previous")}
            nextLabel={t("next")}
          />
        </>
      )}
      <Dialog
        open={!!selected}
        title={t("confirmRemove")}
        closeLabel={t("close")}
        onClose={() => setSelected(null)}
      >
        <div className="actions">
          <Button
            variant="danger"
            loading={busy}
            onClick={() => {
              void remove();
            }}
          >
            {t("remove")}
          </Button>
          <Button onClick={() => setSelected(null)}>{t("cancel")}</Button>
        </div>
      </Dialog>
    </>
  );
}
