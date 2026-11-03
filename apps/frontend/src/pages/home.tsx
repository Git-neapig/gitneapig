import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Terminal, GitPullRequest, CalendarCheck, ArrowDown } from "lucide-react";
import { useLocale } from "../lib/i18n";

const sequence = [
  ["$ git status", "On branch main"],
  [
    "$ git switch -c feature/navbar",
    "Switched to a new branch 'feature/navbar'",
  ],
  ["$ git add src/components/Navbar.tsx", ""],
  [
    '$ git commit -m "feat: add navbar"',
    "[feature/navbar c4a71d2] feat: add navbar",
  ],
  [
    "$ git push -u origin feature/navbar",
    "Branch 'feature/navbar' tracks 'origin/feature/navbar'.",
  ],
];
function HeroTerminal() {
  const [frame, setFrame] = useState({ step: 0, characters: 0 });
  const [reduced, setReduced] = useState(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)"),
      update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (reduced) return;
    const command = sequence[frame.step][0];
    const timeout = setTimeout(
      () =>
        setFrame(
          frame.characters < command.length
            ? { ...frame, characters: frame.characters + 1 }
            : { step: (frame.step + 1) % sequence.length, characters: 0 },
        ),
      frame.characters < command.length
        ? 55
        : frame.step === sequence.length - 1
          ? 2600
          : 1000,
    );
    return () => clearTimeout(timeout);
  }, [frame, reduced]);
  return (
    <div className="hero-media" aria-hidden="true">
      <div className="hero-terminal">
        <div className="terminal-heading">
          <Terminal size={16} />
          <span>gitneapig / project</span>
          <span className="terminal-lights">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="hero-terminal-output">
          {sequence.map(([command, output], index) => (
            <div
              className="hero-command"
              key={command}
              style={{
                visibility:
                  !reduced && index > frame.step ? "hidden" : "visible",
              }}
            >
              <code className="hero-command-line">
                <span className="hero-reserve">{command}</span>
                <span className="hero-typed">
                  {reduced || index < frame.step
                    ? command
                    : command.slice(0, frame.characters)}
                  {!reduced && index === frame.step ? (
                    <span className="cursor">▌</span>
                  ) : null}
                </span>
              </code>
              <pre
                style={{
                  visibility:
                    reduced ||
                    index < frame.step ||
                    (index === frame.step &&
                      frame.characters === command.length)
                      ? "visible"
                      : "hidden",
                }}
              >
                {output}
              </pre>
            </div>
          ))}
        </div>
      </div>
      <img className="hero-mascot" src="/mascots/hero/home-hero-transparent.png" alt="" />
    </div>
  );
}
export function HomePage() {
  const { t } = useLocale();
  const choices = [
    {
      key: "learn",
      to: "/learn",
      description: "learnDescription",
      Icon: BookOpen,
    },
    {
      key: "practice",
      to: "/practice",
      description: "practiceDescription",
      Icon: Terminal,
    },
    {
      key: "quests",
      to: "/quests",
      description: "questDescription",
      Icon: GitPullRequest,
    },
    {
      key: "daily",
      to: "/daily-challenge",
      description: "dailyDescription",
      Icon: CalendarCheck,
    },
  ];
  return (
    <div className="home-scroll">
      <section className="home-section hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              Gitnea<span>Pig</span>
            </h1>
            <h2>{t("heroTitle")}</h2>
            <p>{t("heroBody")}</p>
            <div className="actions">
              <Link className="button button-primary button-lg" to="/learn">
                {t("startLearning")}
                <ArrowRight size={18} />
              </Link>
              <Link className="button button-ghost" to="/practice?mode=free">
                {t("freePractice")}
              </Link>
            </div>
          </div>
          <HeroTerminal />
        </div>
        <a
          className="next-section"
          href="#next-step"
          aria-label={t("nextStep")}
        >
          <ArrowDown size={22} />
        </a>
      </section>
      <section id="next-step" className="home-section next-step">
        <div className="next-step-inner">
          <h2>{t("nextStep")}</h2>
          <div className="home-choices">
            {choices.map(({ key, to, description, Icon }, index) => (
              <Link key={key} to={to} className="home-choice">
                <div className={`choice-icon choice-${index}`}>
                  <Icon size={28} />
                </div>
                <h3>{t(key)}</h3>
                <p>{t(description)}</p>
                <ArrowRight size={20} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
