import { useSearchParams } from "react-router-dom";
import type { CommandReferenceListItem, PaginatedResponse } from "@gitneapig/shared";
import { useResource } from "../lib/api";
import { useLocale } from "../lib/i18n";
import { Badge, Pagination, SearchInput, Select } from "../components/ui";
import { Failure, Loading, PageHeading } from "../components/feedback";
export function ReferencePage() {
  const { t, text } = useLocale(),
    [query, setQuery] = useSearchParams();
  const parameters = new URLSearchParams(query);
  if (!parameters.has("pageSize")) parameters.set("pageSize", "8");
  const resource = useResource<PaginatedResponse<CommandReferenceListItem>>(
    `/reference/commands?${parameters.toString()}`,
  );
  function filter(key: string, value: string) {
    setQuery(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.set("page", "1");
        return next;
      },
      { replace: true },
    );
  }
  return (
    <div className="reference-final">
      <PageHeading title={t("reference")} />
      <SearchInput
        label={t("search")}
        clearLabel={t("clear")}
        value={query.get("q") ?? ""}
        onChange={(value) => filter("q", value)}
      />
      <div className="reference-filters">
        <div
          className="reference-filter-line"
          role="group"
          aria-label={t("category")}
        >
          <span>{t("category")}</span>
          {[
            "",
            "SETUP",
            "INSPECT",
            "STAGE",
            "COMMIT",
            "BRANCH",
            "MERGE",
            "REMOTE",
          ].map((category) => (
            <button
              key={category}
              type="button"
              className="button"
              aria-pressed={(query.get("category") ?? "") === category}
              onClick={() => filter("category", category)}
            >
              {t(category || "all")}
            </button>
          ))}
        </div>
        <div
          className="reference-filter-line"
          role="group"
          aria-label={t("difficulty")}
        >
          <span>{t("difficulty")}</span>
          {["", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              className="button"
              aria-pressed={(query.get("difficulty") ?? "") === difficulty}
              onClick={() => filter("difficulty", difficulty)}
            >
              {t(difficulty || "all")}
            </button>
          ))}
        </div>
      </div>
      <div className="reference-results-heading">
        <p className="muted" aria-live="polite">
          {resource.data?.totalItems ?? 0}{" "}
          {text({ ko: "개 명령어", en: "commands", ja: "件のコマンド" })}
        </p>
        <Select
          label={t("sort")}
          value={query.get("sort") ?? "NAME_ASC"}
          onChange={(e) => filter("sort", e.target.value)}
        >
          {["NAME_ASC", "NAME_DESC", "DIFFICULTY_ASC", "DIFFICULTY_DESC"].map(
            (key) => (
              <option value={key} key={key}>
                {t(key)}
              </option>
            ),
          )}
        </Select>
      </div>
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Failure error={resource.error} retry={resource.refresh} />
      ) : (
        <>
          <div className="reference-card-grid">
            {resource.data?.items.map((command) => (
              <article className="reference-command-card" key={command.id}>
                <div className="reference-card-link">
                  <div className="reference-card-title">
                    <h2>{command.name}</h2>
                    <Badge
                      tone={
                        command.difficulty === "BEGINNER"
                          ? "success"
                          : command.difficulty === "ADVANCED"
                            ? "danger"
                            : "info"
                      }
                    >
                      {t(command.difficulty)}
                    </Badge>
                  </div>
                  <code className="muted">{command.syntax[0]}</code>
                  <p>{text(command.shortDescription)}</p>
                  <span className="muted">{t(command.category)}</span>
                </div>
                <div className="reference-card-bookmark">
                  
                </div>
              </article>
            ))}
          </div>
          {!resource.data?.items.length && (
            <p className="empty-state muted">{t("noResults")}</p>
          )}
          <Pagination
            page={resource.data?.page ?? 1}
            pages={resource.data?.totalPages ?? 0}
            onChange={(page) => filter("page", String(page))}
            previousLabel={t("previous")}
            nextLabel={t("next")}
          />
        </>
      )}
      <p className="muted reference-education-note">
        {text({
          ko: "난이도는 기본 사용법에 따른 GitneaPig의 교육 분류입니다. 공식 Git 등급이 아닙니다.",
          en: "Levels are GitneaPig’s educational grouping for basic use, not official Git ratings.",
          ja: "難易度は基本的な使い方に基づくGitneaPigの教育分類です。Git公式の等級ではありません。",
        })}
      </p>
    </div>
  );
}
