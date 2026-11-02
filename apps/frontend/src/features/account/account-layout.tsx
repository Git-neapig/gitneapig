import { Link, NavLink, Outlet } from "react-router-dom";
import { calculateLevel } from "@gitneapig/shared";
import { Avatar, ProgressBar } from "../../components/ui";
import { accountLinks } from "../../components/shell";
import { useLocale } from "../../lib/i18n";
import { useSession } from "../../lib/session";
import "../../styles/account-final.css";

export function AccountNavigation() {
  const { t } = useLocale();
  return (
    <nav className="account-navigation" aria-label={t("profile")}>
      {accountLinks.map(([to, key]) => (
        <NavLink key={to} end to={to}>
          {t(key)}
        </NavLink>
      ))}
    </nav>
  );
}
export function AccountLayout() {
  const { t } = useLocale(),
    { user } = useSession();
  if (!user) return null;
  const level = calculateLevel(user.xp);
  return (
    <div className="account-layout">
      <div className="profile-heading">
        <Avatar src={user.avatarUrl} alt={user.nickname} size="xl" />
        <div>
          <h1>{user.nickname}</h1>
          <p className="muted">
            {t("level")} {user.level}
          </p>
          <ProgressBar value={level.progressPercent} label={t("progress")} />
          <small className="muted">
            {level.currentLevelXp} / {level.nextLevelXp} XP
          </small>
        </div>
        <Link className="button" to="/profile/edit">
          {t("settings")}
        </Link>
      </div>
      <AccountNavigation />
      <div className="account-content">
        <Outlet />
      </div>
    </div>
  );
}
