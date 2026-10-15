import { playgrounds } from "@gitneapig/simulator";
import { PageHeading } from "../components/feedback";
import { useLocale } from "../lib/i18n";
import { useSimulator } from "../features/workspace/use-simulator";
import { Workspace, ResetButton } from "../features/workspace/workspace";

const definition = playgrounds.find((item) => item.key === "FREE")!;
export function PracticePage() {
  const runtime = useSimulator(definition.initialState),
    { text } = useLocale();
  // Legacy mode/command links open the sandbox without executing commands.
  return (
    <>
      <PageHeading
        title={text(definition.title)}
        actions={<ResetButton reset={runtime.reset} confirm />}
      />
      <Workspace
        key={runtime.attempt}
        state={runtime.repository}
        entries={runtime.entries}
        onRun={runtime.run}
        onEdit={runtime.edit}
      />
    </>
  );
}
