import { useMemo } from "react";
import type { RepositoryState } from "@gitneapig/shared";
import { useLocale } from "../../lib/i18n";
import { Badge } from "../../components/ui";
export function GitGraph({ state }: { state: RepositoryState }) {
  const { t } = useLocale();
  const graph = useMemo(() => {
    const commits = new Map(state.commits.map((c) => [c.id, c]));
    for (const remote of state.remotes)
      for (const commit of remote.commits)
        if (!commits.has(commit.id)) commits.set(commit.id, commit);
    const ordered = [...commits.values()].sort(
      (a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1)),
    );
    const refs = [
      ...state.branches.map((b) => ({
        name: b.name,
        id: b.commitId,
        remote: false,
      })),
      ...state.remoteTrackingBranches.map((b) => ({
        name: `${b.remoteName}/${b.branchName}`,
        id: b.commitId,
        remote: true,
      })),
      ...state.remotes.flatMap((r) =>
        r.branches.map((b) => ({
          name: `${r.name} (${b.name})`,
          id: b.commitId,
          remote: true,
        })),
      ),
    ];
    const lanes = new Map<string, number>();
    let nextLane = 0;
    for (const ref of refs) {
      let id = ref.id;
      const lane = lanes.get(id ?? "") ?? nextLane++;
      while (id && !lanes.has(id)) {
        lanes.set(id, lane);
        id = commits.get(id)?.parentIds[0] ?? null;
      }
    }
    for (const commit of ordered)
      if (!lanes.has(commit.id)) lanes.set(commit.id, nextLane++);
    return {
      ordered,
      refs,
      lanes,
      width: Math.max(48, Math.min(nextLane, 8) * 22 + 24),
    };
  }, [state]);
  if (!graph.ordered.length)
    return <p className="empty-state muted">{t("noCommits")}</p>;
  const y = (id: string) =>
      graph.ordered.findIndex((c) => c.id === id) * 92 + 28,
    x = (id: string) => 16 + (graph.lanes.get(id)! % 8) * 22;
  return (
    <div className="graph-scroll">
      <div
        className="graph-layout"
        style={{ gridTemplateColumns: `${graph.width}px minmax(0,1fr)` }}
      >
        <svg aria-hidden width={graph.width} height={graph.ordered.length * 92}>
          {graph.ordered.flatMap((commit) =>
            commit.parentIds
              .filter((id) => graph.ordered.some((c) => c.id === id))
              .map((parent) => (
                <path
                  key={`${commit.id}-${parent}`}
                  d={`M${x(commit.id)},${y(commit.id)} C${x(commit.id)},${y(commit.id) + 44} ${x(parent)},${y(parent) - 44} ${x(parent)},${y(parent)}`}
                  fill="none"
                  stroke={`var(--graph-${(graph.lanes.get(commit.id)! % 6) + 1})`}
                  strokeWidth="2"
                />
              )),
          )}
          {graph.ordered.map((commit) => (
            <circle
              key={commit.id}
              cx={x(commit.id)}
              cy={y(commit.id)}
              r={state.headCommitId === commit.id ? 7 : 5}
              fill={`var(--graph-${(graph.lanes.get(commit.id)! % 6) + 1})`}
              stroke="var(--color-surface-1)"
              strokeWidth="2"
            />
          ))}
        </svg>
        <ol className="graph-commits">
          {graph.ordered.map((commit) => (
            <li key={commit.id}>
              <div className="graph-labels">
                {state.headCommitId === commit.id ? (
                  <Badge tone="primary">HEAD</Badge>
                ) : null}
                {graph.refs
                  .filter((r) => r.id === commit.id)
                  .map((r) => (
                    <span
                      key={r.name}
                      className={r.remote ? "remote-label" : "branch-label"}
                      title={r.name}
                    >
                      {r.name}
                    </span>
                  ))}
              </div>
              <div className="commit-message" title={commit.message}>
                <code>{commit.id}</code> {commit.message}
              </div>
              <small className="muted">
                {commit.parentIds.join(" · ") || "root"}
              </small>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
