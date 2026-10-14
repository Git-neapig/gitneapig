import { useEffect, useRef, useState } from "react";
import { ArrowDown, Play, Terminal as TerminalIcon } from "lucide-react";
import { IconButton } from "../../components/ui";
import { useLocale } from "../../lib/i18n";
import type { TerminalEntry } from "./use-simulator";
export function TerminalPanel({
  branch,
  entries,
  onRun,
  readOnly = false,
}: {
  branch: string;
  entries: TerminalEntry[];
  onRun: (command: string) => void;
  readOnly?: boolean;
}) {
  const { t } = useLocale(),
    [input, setInput] = useState(""),
    [historyIndex, setHistoryIndex] = useState(-1),
    [hasNew, setHasNew] = useState(false);
  const output = useRef<HTMLDivElement>(null),
    follow = useRef(true),
    draft = useRef(""),
    inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const element = output.current;
    if (!element) return;
    const handOff = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
        return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 24
          : event.deltaMode === 2
            ? element.clientHeight
            : 1);
      const boundary =
        element.scrollHeight <= element.clientHeight + 1 ||
        (delta < 0 && element.scrollTop <= 1) ||
        (delta > 0 &&
          element.scrollTop + element.clientHeight >= element.scrollHeight - 1);
      if (!boundary) return;
      const root = document.scrollingElement;
      if (
        !root ||
        (delta < 0
          ? root.scrollTop <= 0
          : root.scrollTop + root.clientHeight >= root.scrollHeight)
      )
        return;
      // Explicit handoff also works while a browser's wheel gesture is latched to the terminal.
      event.preventDefault();
      window.scrollBy({ top: delta, behavior: "instant" });
    };
    element.addEventListener("wheel", handOff, { passive: false });
    return () => element.removeEventListener("wheel", handOff);
  }, []);
  useEffect(() => {
    if (follow.current && output.current) {
      output.current.scrollTop = output.current.scrollHeight;
      setHasNew(false);
    } else setHasNew(true);
  }, [entries]);
  function submit() {
    if (readOnly || !input.trim()) return;
    onRun(input);
    setInput("");
    setHistoryIndex(-1);
    draft.current = "";
    inputRef.current?.focus();
  }
  return (
    <section className="terminal-panel" aria-label={t("terminal")}>
      <div className="terminal-heading">
        <TerminalIcon size={17} />
        <strong>{t("terminal")}</strong>
        <code className="muted">{branch}</code>
      </div>
      <div
        ref={output}
        className="terminal-output"
        tabIndex={0}
        role="log"
        aria-live="polite"
        aria-label={t("terminal")}
        onScroll={() => {
          const el = output.current!;
          follow.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 48;
          if (follow.current) setHasNew(false);
        }}
      >
        {entries.map((entry, index) => (
          <div key={index} className="terminal-entry">
            <pre className="terminal-command">
              <span aria-hidden>$ </span>
              {entry.command}
            </pre>
            <pre className={entry.success ? "" : "terminal-error"}>
              {entry.output}
            </pre>
          </div>
        ))}
      </div>
      {hasNew ? (
        <IconButton
          label={t("next")}
          className="terminal-new-output"
          onClick={() => {
            follow.current = true;
            if (output.current)
              output.current.scrollTop = output.current.scrollHeight;
            setHasNew(false);
          }}
        >
          <ArrowDown size={18} />
        </IconButton>
      ) : null}
      <form
        className="terminal-input"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <span aria-hidden>$</span>
        <input
          ref={inputRef}
          readOnly={readOnly}
          value={input}
          aria-label={t("commandInput")}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={4096}
          onChange={(e) => {
            setInput(e.target.value);
            setHistoryIndex(-1);
          }}
          onKeyDown={(e) => {
            if (!["ArrowUp", "ArrowDown"].includes(e.key) || !entries.length)
              return;
            e.preventDefault();
            if (historyIndex === -1) draft.current = input;
            const next =
              e.key === "ArrowUp"
                ? Math.min(entries.length - 1, historyIndex + 1)
                : Math.max(-1, historyIndex - 1);
            setHistoryIndex(next);
            setInput(
              next < 0
                ? draft.current
                : entries[entries.length - 1 - next].command,
            );
          }}
        />
        <IconButton
          type="submit"
          label={t("execute")}
          disabled={readOnly || !input.trim()}
        >
          <Play size={18} />
        </IconButton>
      </form>
    </section>
  );
}
