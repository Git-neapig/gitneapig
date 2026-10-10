import { Route, Routes, Link } from "react-router-dom";

import { AuthPage } from "./pages/auth";
import { useLocale } from "./lib/i18n";
import { SessionProvider } from "./lib/session";
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
          
          
          
          
          
          
          
          <Route path="login" element={<AuthPage />} />
          <Route path="signup" element={<AuthPage signup />} />
          
          
          
          
          
          
          <Route path="*" element={<NotFound />} />
      </Routes>
    </SessionProvider>
  );
}
