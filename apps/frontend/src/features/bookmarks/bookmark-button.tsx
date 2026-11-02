import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark as BookmarkIcon } from "lucide-react";
import type { Bookmark, PaginatedResponse } from "@gitneapig/shared";
import { IconButton } from "../../components/ui";
import { Failure } from "../../components/feedback";
import { api, useResource } from "../../lib/api";
import { useLocale } from "../../lib/i18n";
import { useSession } from "../../lib/session";

export function BookmarkButton({
  targetType,
  targetId,
  stage = null,
}: {
  targetType: Bookmark["targetType"];
  targetId: string;
  stage?: Bookmark["stage"];
}) {
  const { user } = useSession(),
    { t } = useLocale(),
    resource = useResource<PaginatedResponse<Bookmark>>(
      user ? "/bookmarks?pageSize=100" : null,
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const existing = resource.data?.items.find(
    (item) =>
      item.targetType === targetType &&
      item.targetId === targetId &&
      item.stage === stage,
  );
  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      await api(existing ? `/bookmarks/${existing.id}` : "/bookmarks", {
        method: existing ? "DELETE" : "POST",
        body: existing ? undefined : { targetType, targetId, stage },
      });
      resource.refresh();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      {user ? (
        <IconButton
          label={t(existing ? "unbookmark" : "bookmark")}
          aria-pressed={!!existing}
          disabled={busy || resource.loading || !!resource.error}
          onClick={() => {
            void toggle();
          }}
        >
          <BookmarkIcon size={20} fill={existing ? "currentColor" : "none"} />
        </IconButton>
      ) : (
        <Link
          className="button icon-button"
          aria-label={t("bookmark")}
          to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        >
          <BookmarkIcon size={20} />
        </Link>
      )}
      {error || resource.error ? (
        <Failure error={error ?? resource.error} retry={resource.refresh} />
      ) : null}
    </div>
  );
}
