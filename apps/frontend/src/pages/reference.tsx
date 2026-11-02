import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Copy, Check } from "lucide-react";
import type { CommandReferenceDetail, CommandReferenceListItem, LessonSummary, PaginatedResponse, QuestDefinition } from "@gitneapig/shared";
import { useResource } from "../lib/api";

import { useLocale } from "../lib/i18n";
import { Badge, Breadcrumb, IconButton, Pagination, SearchInput, Select } from "../components/ui";
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
                <Link
                  className="reference-card-link"
                  to={`/reference/${command.key}`}
                >
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
                </Link>
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
export function ReferenceDetailPage() {
  const { key } = useParams(),
    { t, text } = useLocale();
  const resource = useResource<CommandReferenceDetail>(
    `/reference/commands/${encodeURIComponent(key ?? "")}`,
  );
  const lessons = useResource<{ items: LessonSummary[] }>("/lessons");
  const quests = useResource<{
    items: Pick<QuestDefinition, "id" | "slug" | "title">[];
  }>("/quests");
  if (resource.loading) return <Loading />;
  if (resource.error)
    return <Failure error={resource.error} retry={resource.refresh} />;
  if (!resource.data) return null;
  const { core, reference, options } = resource.data;
  const firstExample = reference.examples.find(
    (example) => example.before && example.after,
  );
  const supported = core.simulatorSupported;
  return (
    <div className="reference-final">
      <Breadcrumb
        items={[
          { label: t("reference"), to: "/reference" },
          { label: core.name },
        ]}
      />
      <div className="reference-detail-heading">
        <h1>{core.name}</h1>
        <Badge
          tone={
            reference.difficulty === "BEGINNER"
              ? "success"
              : reference.difficulty === "ADVANCED"
                ? "danger"
                : "info"
          }
        >
          {t(reference.difficulty)}
        </Badge>
        
      </div>
      <p className="muted">{t(core.category)}</p>
      <p>{text(core.shortDescription)}</p>
      <div className="reference-syntax">
        {core.syntax.map((syntax) => (
          <CommandCopy key={syntax} command={syntax} />
        ))}
      </div>
      <div className="reference-detail-columns">
        <div className="reference-detail-main">
          <section>
            <h2>{t("whenToUse")}</h2>
            <p>{text(reference.whenToUse)}</p>
          </section>
          <section>
            <h2>
              {text({
                ko: "주요 옵션",
                en: "Common options",
                ja: "主なオプション",
              })}
            </h2>
            <div
              className="reference-options-scroll"
              tabIndex={0}
              role="region"
              aria-label={text({
                ko: "옵션 표",
                en: "Options table",
                ja: "オプション表",
              })}
            >
              <table className="reference-options">
                <thead>
                  <tr>
                    <th>
                      {text({ ko: "옵션", en: "Option", ja: "オプション" })}
                    </th>
                    <th>
                      {text({
                        ko: "효과 · 예시 · 주의점",
                        en: "Effect · example · caution",
                        ja: "効果・例・注意点",
                      })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {options.map((option) => (
                    <tr key={option.flag}>
                      <th scope="row">
                        <code>{option.flag}</code>
                      </th>
                      <td>
                        <p>{text(option.effect)}</p>
                        <CommandCopy command={option.example} />
                        <p className="muted">{text(option.caution)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h2>{t("examples")}</h2>
            {reference.examples.map((example) => (
              <div className="reference-example" key={example.command}>
                <CommandCopy command={example.command} />
                <p>{text(example.description)}</p>
                {example !== firstExample && example.before && (
                  <p>
                    <strong>{t("beforeCommand")}</strong> {text(example.before)}
                  </p>
                )}
                {example !== firstExample && example.after && (
                  <p>
                    <strong>{t("afterCommand")}</strong> {text(example.after)}
                  </p>
                )}
              </div>
            ))}
          </section>
        </div>
        <aside className="reference-detail-aside">
          {firstExample && (
            <section>
              <h2>
                {t("beforeCommand")} / {t("afterCommand")}
              </h2>
              <div className="reference-before-after">
                <div>
                  <h3>{t("beforeCommand")}</h3>
                  <p>{firstExample.before && text(firstExample.before)}</p>
                </div>
                <div>
                  <h3>{t("afterCommand")}</h3>
                  <p>{firstExample.after && text(firstExample.after)}</p>
                </div>
              </div>
            </section>
          )}
          <section>
            <h2>{t("mistakes")}</h2>
            {reference.commonMistakes.map((mistake, index) => (
              <p className="reference-caution" key={index}>
                {text(mistake)}
              </p>
            ))}
            {core.key === "push" && (
              <p className="reference-caution danger">
                {text({
                  ko: "거절된 push는 강제 전송의 이유가 아닙니다. 먼저 원격 변경을 확인하세요. --force-with-lease도 안전을 보장하지 않습니다.",
                  en: "A rejected push is not a reason to force-push. Inspect remote changes first. --force-with-lease is not a safety guarantee.",
                  ja: "pushの拒否は強制送信の理由ではありません。先にリモート変更を確認してください。--force-with-leaseも安全の保証ではありません。",
                })}
              </p>
            )}
          </section>
          <section>
            <h2>{t("related")}</h2>
            <div className="related-links">
              {reference.relatedCommandKeys.map((key) => (
                <Link className="text-link" key={key} to={`/reference/${key}`}>
                  git {key}
                </Link>
              ))}
              {lessons.data?.items
                .filter((lesson) =>
                  reference.relatedLessonIds.includes(lesson.id),
                )
                .map((lesson) => (
                  <Link
                    className="text-link"
                    key={lesson.id}
                    to={`/learn/${lesson.slug}`}
                  >
                    {text(lesson.title)}
                  </Link>
                ))}
              {quests.data?.items
                .filter((quest) => reference.relatedQuestIds.includes(quest.id))
                .map((quest) => (
                  <Link
                    className="text-link"
                    key={quest.id}
                    to={`/quests/${quest.slug}`}
                  >
                    {text(quest.title)}
                  </Link>
                ))}
            </div>
          </section>
          <section>
            <h2>{t("officialGitDocs")}</h2>
            <div className="related-links">
              <a
                className="text-link"
                href={`https://git-scm.com/docs/git-${core.key}`}
                target="_blank"
                rel="noreferrer"
              >
                git {core.key}
                <ArrowRight size={16} />
              </a>
              <a
                className="text-link"
                href="https://git-scm.com/book/en/v2"
                target="_blank"
                rel="noreferrer"
              >
                Pro Git
                <ArrowRight size={16} />
              </a>
            </div>
          </section>
          <section className="reference-support">
            <h2>
              {text({
                ko: "실습 지원",
                en: "Practice support",
                ja: "実習対応",
              })}
            </h2>
            <p>
              {text(
                supported
                  ? {
                      ko: "이 명령의 기본 기능은 시뮬레이터에서 지원합니다. 위 표는 실제 Git 옵션이며 지원되는 구문은 실습의 명령어 가이드에서 확인하세요.",
                      en: "Basic features of this command work in the simulator. The table documents real Git; check the practice command guide for supported syntax.",
                      ja: "このコマンドの基本機能はシミュレーターに対応しています。表は実際のGitの説明です。対応構文は実習のコマンドガイドを確認してください。",
                    }
                  : {
                      ko: "이 명령은 사전에서 학습할 수 있으며 현재 시뮬레이터에서는 실행되지 않습니다.",
                      en: "This command is documented here but is not executable in the current simulator.",
                      ja: "このコマンドは辞典で学べますが、現在のシミュレーターでは実行できません。",
                    },
              )}
            </p>
            {supported && (
              <Link className="button button-primary" to="/practice">
                {t("practiceCommand")}
                <ArrowRight size={18} />
              </Link>
            )}
          </section>
        </aside>
      </div>
      <Link className="text-link" to="/reference">
        {text({
          ko: "← 명령어 사전으로",
          en: "← Back to Reference",
          ja: "← コマンド辞典へ戻る",
        })}
      </Link>
    </div>
  );
}
function CommandCopy({ command }: { command: string }) {
  const { t } = useLocale(),
    [copied, setCopied] = useState(false),
    [error, setError] = useState<unknown>(null);
  return (
    <>
      <div className="command-copy">
        <pre>{command}</pre>
        <IconButton
          label={t(copied ? "copied" : "copy")}
          onClick={() => {
            setError(null);
            void navigator.clipboard
              .writeText(command)
              .then(() => setCopied(true))
              .catch(setError);
          }}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </IconButton>
      </div>
      {error ? <Failure error={error} /> : null}
    </>
  );
}
