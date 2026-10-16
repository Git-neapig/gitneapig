import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Copy, FilePlus2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import {
  commandRegistry,
  type CommandKey,
  type RepositoryState,
} from "@gitneapig/shared";
import { snapshots, validatePath } from "@gitneapig/simulator";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  IconButton,
  Tabs,
  TextInput,
} from "../../components/ui";
import { useLocale } from "../../lib/i18n";
import { TerminalPanel } from "./terminal";
import { GitGraph } from "./graph";
import type { TerminalEntry } from "./use-simulator";

export function RepoState({
  state,
  onEdit,
  readOnly = false,
}: {
  state: RepositoryState;
  onEdit: (path: string, content: string | null) => void;
  readOnly?: boolean;
}) {
  const { t } = useLocale(),
    views = snapshots(state);
  const [editing, setEditing] = useState<{
      path: string;
      content: string;
      existing: boolean;
    } | null>(null),
    [error, setError] = useState("");
  const paths = Object.keys(views.working).sort();
  function save(content: string | null) {
    if (!editing) return;
    try {
      validatePath(editing.path);
      onEdit(editing.path, content);
      setEditing(null);
      setError("");
    } catch {
      setError(t("invalidInput"));
    }
  }
  return (
    <div className="state-panel">
      <div className="section-label">
        <h3>{t("files")}</h3>
        <IconButton
          label={t("newFile")}
          disabled={readOnly}
          onClick={() => {
            setError("");
            setEditing({ path: "", content: "", existing: false });
          }}
        >
          <FilePlus2 size={18} />
        </IconButton>
      </div>
      <ul className="file-list">
        {paths.map((path) => (
          <li key={path}>
            <code>{path}</code>
            {state.mergeState?.conflictedPaths.includes(path) ? (
              <Badge tone="danger">{t("conflict")}</Badge>
            ) : null}
            <IconButton
              label={`${t("editFile")}: ${path}`}
              disabled={readOnly}
              onClick={() => {
                setError("");
                setEditing({
                  path,
                  content: views.working[path] ?? "",
                  existing: true,
                });
              }}
            >
              <Pencil size={16} />
            </IconButton>
          </li>
        ))}
      </ul>
      {[
        ["workingTree", state.workingTree],
        ["stagingArea", state.stagingArea],
      ].map(([label, files]) => (
        <section key={label as string}>
          <h3>{t(label as string)}</h3>
          {(files as RepositoryState["workingTree"]).length ? (
            <ul className="change-list">
              {(files as RepositoryState["workingTree"]).map((file) => (
                <li key={file.path}>
                  <span className={`file-status status-${file.status}`}>
                    {t(file.status)}
                  </span>
                  <code>{file.path}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t("clean")}</p>
          )}
        </section>
      ))}
      <section>
        <h3>{t("branch")}</h3>
        {state.branches.map((branch) => (
          <div key={branch.name} className="ref-row">
            <code>
              {branch.name === state.currentBranch ? "* " : ""}
              {branch.name}
            </code>
            <code className="muted">{branch.commitId ?? "∅"}</code>
            {branch.upstream ? (
              <small className="muted">
                {branch.upstream.remoteName}/{branch.upstream.branchName}
              </small>
            ) : null}
          </div>
        ))}
      </section>
      <section>
        <h3>{t("remotes")}</h3>
        {state.remotes.map((remote) => (
          <div key={remote.name}>
            {remote.branches.map((branch) => (
              <div className="ref-row" key={branch.name}>
                <code>
                  {remote.name}/{branch.name}
                </code>
                <code>{branch.commitId ?? "∅"}</code>
              </div>
            ))}
          </div>
        ))}
      </section>
      <Dialog
        open={!!editing}
        title={editing?.existing ? t("editFile") : t("newFile")}
        onClose={() => setEditing(null)}
        closeLabel={t("close")}
      >
        {editing ? (
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              save(editing.content);
            }}
          >
            <TextInput
              label={t("filePath")}
              value={editing.path}
              required
              disabled={editing.existing}
              onChange={(e) => setEditing({ ...editing, path: e.target.value })}
            />
            <label className="field">
              {t("fileContent")}
              <textarea
                value={editing.content}
                rows={12}
                maxLength={200000}
                spellCheck={false}
                onChange={(e) =>
                  setEditing({ ...editing, content: e.target.value })
                }
                className="file-editor"
              />
            </label>
            {error ? <Alert tone="danger">{error}</Alert> : null}
            <div className="actions">
              {editing.existing ? (
                <Button variant="danger" onClick={() => save(null)}>
                  <Trash2 size={16} />
                  {t("deleteFile")}
                </Button>
              ) : null}
              <Button type="submit" variant="primary">
                {t("save")}
              </Button>
              <Button onClick={() => setEditing(null)}>{t("cancel")}</Button>
            </div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
function CommandGuide({
  keys,
  selected,
}: {
  keys: CommandKey[];
  selected?: string;
}) {
  const { t, text } = useLocale(),
    [copyError, setCopyError] = useState(false);
  return (
    <div className="command-guide">
      {copyError ? <Alert tone="warning">{t("error")}</Alert> : null}
      {commandRegistry
        .filter((command) => keys.includes(command.key))
        .sort((a, b) => Number(b.key === selected) - Number(a.key === selected))
        .map((command) => (
          <section
            key={command.key}
            className={selected === command.key ? "guide-selected" : ""}
          >
            <div className="section-label">
              <h3>{command.name}</h3>
              <IconButton
                label={t("copy")}
                onClick={() => {
                  void navigator.clipboard
                    .writeText(command.shortExample!.command)
                    .catch(() => setCopyError(true));
                }}
              >
                <Copy size={16} />
              </IconButton>
            </div>
            <p className="muted">{text(command.shortDescription)}</p>
            {command.syntax.map((syntax) => (
              <pre key={syntax}>{syntax}</pre>
            ))}
            {command.shortExample ? (
              <>
                <pre>{command.shortExample.command}</pre>
                <p className="muted">
                  {text(command.shortExample.description)}
                </p>
              </>
            ) : null}
          </section>
        ))}
    </div>
  );
}
export function Workspace({
  state,
  entries,
  onRun,
  onEdit,
  guideKeys,
  selectedCommand,
  initialTab,
  hints,
  introduction,
  readOnly = false,
  terminalFooter,
  toolFooter,
}: {
  state: RepositoryState;
  entries: TerminalEntry[];
  onRun: (command: string) => void;
  onEdit: (path: string, content: string | null) => void;
  guideKeys?: CommandKey[];
  selectedCommand?: string;
  initialTab?: string;
  hints?: ReactNode;
  introduction?: ReactNode;
  readOnly?: boolean;
  terminalFooter?: ReactNode;
  toolFooter?: ReactNode;
}) {
  const workspace = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = workspace.current;
    if (!element) return;
    const measure = () => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      element.style.setProperty("--workspace-top", `${top}px`);
      element
        .closest<HTMLElement>(".quest-workspace")
        ?.style.setProperty("--workspace-top", `${top}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  const { t } = useLocale(),
    [tab, setTab] = useState(
      initialTab ?? (selectedCommand ? "guide" : "graph"),
    );
  const tabs = [
    { value: "graph", label: t("graph") },
    { value: "state", label: t("state") },
    ...(guideKeys ? [{ value: "guide", label: t("guide") }] : []),
    ...(hints ? [{ value: "hints", label: t("hints") }] : []),
  ];
  return (
    <div className="workspace" ref={workspace}>
      <div className="workspace-terminal">
        {introduction ? (
          <div className="workspace-introduction">{introduction}</div>
        ) : null}
        <TerminalPanel
          branch={state.currentBranch}
          entries={entries}
          onRun={onRun}
          readOnly={readOnly}
        />
        {terminalFooter}
      </div>
      <section className="tool-panel">
        <Tabs label={t("tools")} items={tabs} value={tab} onChange={setTab} />
        <div className="tool-content" role="tabpanel" aria-label={t(tab)}>
          {tab === "graph" ? (
            <GitGraph state={state} />
          ) : tab === "state" ? (
            <RepoState state={state} onEdit={onEdit} readOnly={readOnly} />
          ) : tab === "hints" ? (
            hints
          ) : (
            <CommandGuide keys={guideKeys ?? []} selected={selectedCommand} />
          )}
        </div>
        {toolFooter}
      </section>
    </div>
  );
}
export function ResetButton({
  reset,
  confirm = false,
}: {
  reset: () => void;
  confirm?: boolean;
}) {
  const { t } = useLocale(),
    [open, setOpen] = useState(false);
  return (
    <>
      <IconButton
        label={t("reset")}
        onClick={() => (confirm ? setOpen(true) : reset())}
      >
        <RotateCcw size={18} />
      </IconButton>
      <Dialog
        open={open}
        title={t("resetConfirm")}
        onClose={() => setOpen(false)}
        closeLabel={t("close")}
      >
        <p>{t("resetNote")}</p>
        <div className="actions">
          <Button
            variant="danger"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            {t("reset")}
          </Button>
          <Button onClick={() => setOpen(false)}>{t("cancel")}</Button>
        </div>
      </Dialog>
    </>
  );
}
