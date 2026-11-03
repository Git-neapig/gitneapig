import { Route, Routes, Link } from "react-router-dom";
import { Shell } from "./components/shell";
import { MemberGate } from "./components/feedback";
import { HomePage } from "./pages/home";
import { PracticePage } from "./pages/practice";
import "./styles/reference-final.css";
import { LearnPage, LessonPage } from "./pages/learn";
import { QuestPage, QuestsPage } from "./pages/quests";
import { DailyPage } from "./pages/daily";
import { AuthPage, OnboardingPage } from "./pages/auth";
import { AccountLayout } from "./features/account/account-layout";
import { AchievementsPage } from "./pages/achievements";
import { EditProfilePage } from "./pages/edit-profile";
import { ProfilePage } from "./pages/profile";
import { ApiKeysPage } from "./pages/api-keys";
import { FriendsPage } from "./pages/friends";
import { BookmarksPage } from "./pages/bookmarks";
import { ReferenceDetailPage, ReferencePage } from "./pages/reference";
import { PolicyPage } from "./pages/policies";
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
          <Route index element={<HomePage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="learn/:slug" element={<LessonPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="quests/:slug" element={<QuestPage />} />
          <Route path="daily-challenge" element={<DailyPage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="signup" element={<AuthPage signup />} />
          <Route path="onboarding/profile" element={<OnboardingPage />} />
          <Route
            element={
              <MemberGate>
                <AccountLayout />
              </MemberGate>
            }
          >
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/edit" element={<EditProfilePage />} />
            <Route path="profile/achievements" element={<AchievementsPage />} />
            <Route path="profile/api-keys" element={<ApiKeysPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="bookmarks" element={<BookmarksPage />} />
          </Route>
          <Route
            path="reference"
            element={
              <MemberGate>
                <ReferencePage />
              </MemberGate>
            }
          />
          <Route
            path="reference/:key"
            element={
              <MemberGate>
                <ReferenceDetailPage />
              </MemberGate>
            }
          />
          <Route path="privacy" element={<PolicyPage type="privacy" />} />
          <Route path="terms" element={<PolicyPage type="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </SessionProvider>
  );
}
