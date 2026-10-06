import { Link, useLocation } from "react-router-dom";

import { Alert, Button, Skeleton } from "./ui";
import { ApiClientError, errorKey } from "../lib/api";
import { useLocale } from "../lib/i18n";

import type { ReactNode } from "react";
export function Loading() {
  const { t } = useLocale();
  return <Skeleton label={t("loading")} />;
}
export function Failure({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const { t } = useLocale(),
    location = useLocation();
  return (
    <div className="failure">
      <Alert tone="danger">{t(errorKey(error))}</Alert>
      {error instanceof ApiClientError &&
      ["UNAUTHORIZED", "AUTH_REQUIRED", "SESSION_EXPIRED"].includes(
        error.code,
      ) ? (
        <Link
          className="button button-primary"
          to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        >
          {t("login")}
        </Link>
      ) : null}
      {retry ? <Button onClick={retry}>{t("retry")}</Button> : null}
    </div>
  );
}
export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}
