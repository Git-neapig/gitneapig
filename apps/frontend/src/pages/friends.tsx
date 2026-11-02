import { useEffect, useState } from "react";
import { Check, Trash2, UserPlus, X } from "lucide-react";
import type {
  FriendRequest,
  PaginatedResponse,
  PublicUserSummary,
} from "@gitneapig/shared";
import { api, useResource } from "../lib/api";
import { useSession } from "../lib/session";
import { useLocale } from "../lib/i18n";
import {
  Avatar,
  Button,
  Dialog,
  IconButton,
  SearchInput,
  StatusDot,
  Pagination,
} from "../components/ui";
import { Failure, Loading, PageHeading } from "../components/feedback";
export function FriendsPage() {
  const { t } = useLocale(),
    { user } = useSession(),
    [revision, setRevision] = useState(0),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [remove, setRemove] = useState<PublicUserSummary | null>(null);
  const friends = useResource<{ items: PublicUserSummary[] }>(
      "/friends",
      revision,
    ),
    requests = useResource<{ items: FriendRequest[] }>(
      "/friends/requests",
      revision,
    ),
    results = useResource<PaginatedResponse<PublicUserSummary>>(
      query
        ? `/users/search?q=${encodeURIComponent(query)}&pageSize=20&page=${page}`
        : null,
      revision,
    );
  useEffect(() => {
    const id = setInterval(() => setRevision((value) => value + 1), 30000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(id);
  }, [search]);
  async function mutate(path: string, method: string, body?: unknown) {
    setBusy(true);
    setError(null);
    try {
      await api(path, { method, body });
      setRevision((value) => value + 1);
      setRemove(null);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  const related = new Set([
    ...(friends.data?.items.map((friend) => friend.id) ?? []),
    ...(requests.data?.items.flatMap((request) => [
      request.sender.id,
      request.receiver.id,
    ]) ?? []),
  ]);
  return (
    <>
      <PageHeading title={t("friends")} />
      <SearchInput
        label={t("searchUsers")}
        clearLabel={t("clear")}
        value={search}
        onChange={setSearch}
      />
      {error ? <Failure error={error} /> : null}
      {query ? (
        <section className="friends-section">
          <h2>{t("search")}</h2>
          {results.loading ? (
            <Loading />
          ) : results.error ? (
            <Failure error={results.error} retry={results.refresh} />
          ) : results.data?.items.length ? (
            results.data.items.map((person) => (
              <div className="person-row" key={person.id}>
                <Avatar src={person.avatarUrl} alt={person.nickname} />
                <strong>{person.nickname}</strong>
                <span className="muted">Lv. {person.level}</span>
                <Button
                  disabled={busy || related.has(person.id)}
                  onClick={() => {
                    void mutate("/friends/requests", "POST", {
                      userId: person.id,
                    });
                  }}
                >
                  <UserPlus size={16} />
                  {t(
                    friends.data?.items.some(
                      (friend) => friend.id === person.id,
                    )
                      ? "friends"
                      : related.has(person.id)
                        ? "pending"
                        : "addFriend",
                  )}
                </Button>
              </div>
            ))
          ) : (
            <p className="muted">{t("noResults")}</p>
          )}
          {results.data && results.data.totalPages > 1 ? (
            <Pagination
              page={page}
              pages={results.data.totalPages}
              onChange={setPage}
              previousLabel={t("previous")}
              nextLabel={t("next")}
            />
          ) : null}
        </section>
      ) : null}
      <div className="profile-columns">
        <section className="friends-section">
          <h2>{t("friends")}</h2>
          {friends.loading ? (
            <Loading />
          ) : friends.error ? (
            <Failure error={friends.error} retry={friends.refresh} />
          ) : friends.data?.items.length ? (
            friends.data.items.map((person) => (
              <div className="person-row" key={person.id}>
                <Avatar src={person.avatarUrl} alt={person.nickname} />
                <div>
                  <strong>{person.nickname}</strong>
                  <StatusDot
                    online={person.onlineStatus === "ONLINE"}
                    label={t(
                      person.onlineStatus === "ONLINE" ? "online" : "offline",
                    )}
                  />
                </div>
                <IconButton
                  label={t("remove")}
                  onClick={() => setRemove(person)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            ))
          ) : (
            <p className="muted">{t("nothingYet")}</p>
          )}
        </section>
        <section className="friends-section">
          <h2>{t("requests")}</h2>
          {requests.loading ? (
            <Loading />
          ) : requests.error ? (
            <Failure error={requests.error} retry={requests.refresh} />
          ) : requests.data?.items.length ? (
            requests.data.items.map((request) => {
              const incoming = request.receiver.id === user?.id,
                person = incoming ? request.sender : request.receiver;
              return (
                <div className="person-row" key={request.id}>
                  <Avatar src={person.avatarUrl} alt={person.nickname} />
                  <div>
                    <strong>{person.nickname}</strong>
                    <small className="muted">
                      {t(incoming ? "incoming" : "outgoing")}
                    </small>
                  </div>
                  {incoming ? (
                    <IconButton
                      disabled={busy}
                      label={t("accept")}
                      onClick={() => {
                        void mutate(
                          `/friends/requests/${request.id}/accept`,
                          "POST",
                        );
                      }}
                    >
                      <Check size={18} />
                    </IconButton>
                  ) : null}
                  <IconButton
                    disabled={busy}
                    label={t(incoming ? "decline" : "cancel")}
                    onClick={() => {
                      void mutate(`/friends/requests/${request.id}`, "DELETE");
                    }}
                  >
                    <X size={18} />
                  </IconButton>
                </div>
              );
            })
          ) : (
            <p className="muted">{t("nothingYet")}</p>
          )}
        </section>
      </div>
      <Dialog
        open={!!remove}
        title={t("confirmRemove")}
        closeLabel={t("close")}
        onClose={() => setRemove(null)}
      >
        <p>{remove?.nickname}</p>
        <div className="actions">
          <Button
            variant="danger"
            loading={busy}
            onClick={() => {
              if (remove) void mutate(`/friends/${remove.id}`, "DELETE");
            }}
          >
            {t("remove")}
          </Button>
          <Button onClick={() => setRemove(null)}>{t("cancel")}</Button>
        </div>
      </Dialog>
    </>
  );
}
