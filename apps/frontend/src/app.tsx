import { Route, Routes, Link } from "react-router-dom";
import { Shell } from "./components/shell";

import { PracticePage } from "./pages/practice";
import { LearnPage, LessonPage } from "./pages/learn";
import { QuestPage, QuestsPage } from "./pages/quests";
import { DailyPage } from "./pages/daily";
import { AuthPage } from "./pages/auth";
import { useLocale } from "./lib/i18n";
import { SessionProvider } from "./lib/session";
import "./styles/app.css";
import "./styles/revision.css";
function NotFound() {
  const { t } = useLocale();
  return (
    <div className="empty-state">
      <h1>{t("notFound")}</h1>
      <Link className="button" to="/">
        {t("home")}
      </Link>
    </div>
  );
}
export function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route element={<Shell />}>
          
          <Route path="learn" element={<LearnPage />} />
          <Route path="learn/:slug" element={<LessonPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="quests/:slug" element={<QuestPage />} />
          <Route path="daily-challenge" element={<DailyPage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="signup" element={<AuthPage signup />} />
          
          
          
          
          
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </SessionProvider>
  );
}
