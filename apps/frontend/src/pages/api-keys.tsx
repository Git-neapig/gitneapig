import { useState } from "react";
import { Copy, Plus, Trash2, ExternalLink } from "lucide-react";
import type { ApiKeySummary, CreateApiKeyResponse } from "@gitneapig/shared";
import { api, useResource } from "../lib/api";
import { useLocale } from "../lib/i18n";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  IconButton,
  TextInput,
} from "../components/ui";
import { Failure, Loading, PageHeading } from "../components/feedback";
export function ApiKeysPage() {
  const { t, language } = useLocale(),
    resource = useResource<{ items: ApiKeySummary[] }>("/profile/api-keys"),
    [label, setLabel] = useState(""),
    [raw, setRaw] = useState<string | null>(null),
    [revoke, setRevoke] = useState<ApiKeySummary | null>(null),
    [busy, setBusy] = useState(false),
    [copied, setCopied] = useState(false),
    [error, setError] = useState<unknown>(null);
  async function create() {
    setBusy(true);
    setError(null);
    try {
      const result = await api<CreateApiKeyResponse>("/profile/api-keys", {
        method: "POST",
        body: { label: label.trim() },
      });
      setRaw(result.apiKey);
      setLabel("");
      setCopied(false);
      resource.refresh();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!revoke) return;
    setBusy(true);
    try {
      await api(`/profile/api-keys/${revoke.id}`, { method: "DELETE" });
      setRevoke(null);
      resource.refresh();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title={t("bookmarkIntegration")}
        actions={
          <a
            className="button"
            href="/api/docs"
            target="_blank"
            rel="noreferrer"
          >
            {t("apiDocs")}
            <ExternalLink size={16} />
          </a>
        }
      />
      <section className="integration-intro">
        <p>{t("integrationIntro")}</p>
        <p className="muted">{t("integrationSecret")}</p>
      </section>
      <h2>{t("createKey")}</h2>
      <form
        className="key-create"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <TextInput
          label={t("keyLabel")}
          value={label}
          required
          maxLength={80}
          placeholder={t("keyPurposeExample")}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Button type="submit" variant="primary" loading={busy}>
          <Plus size={18} />
          {t("createKey")}
        </Button>
      </form>
      {error ? <Failure error={error} /> : null}
      <h2>{t("issuedKeys")}</h2>
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Failure error={resource.error} retry={resource.refresh} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("keyLabel")}</th>
                <th>{t("state")}</th>
                <th>{t("createdDate")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {resource.data?.items.map((key) => (
                <tr key={key.id}>
                  <td>{key.label}</td>
                  <td>
                    <Badge tone={key.revokedAt ? "locked" : "success"}>
                      {t(key.revokedAt ? "revoked" : "active")}
                    </Badge>
                  </td>
                  <td>
                    {new Date(key.createdAt).toLocaleDateString(language)}
                  </td>
                  <td>
                    <IconButton
                      label={t("revoke")}
                      disabled={!!key.revokedAt}
                      onClick={() => setRevoke(key)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!resource.data?.items.length ? (
            <p className="empty-state muted">{t("nothingYet")}</p>
          ) : null}
        </div>
      )}
      <Dialog
        open={raw !== null}
        title={t("keyOnce")}
        closeLabel={t("close")}
        onClose={() => setRaw(null)}
      >
        {raw ? (
          <>
            <TextInput
              label={t("apiKeys")}
              value={raw}
              readOnly
              autoComplete="off"
            />
            <Button
              onClick={() => {
                void navigator.clipboard
                  .writeText(raw)
                  .then(() => setCopied(true))
                  .catch(setError);
              }}
            >
              <Copy size={16} />
              {t(copied ? "copied" : "copy")}
            </Button>
            <Alert tone="warning">{t("keyOnce")}</Alert>
          </>
        ) : null}
      </Dialog>
      <Dialog
        open={!!revoke}
        title={t("revoke")}
        closeLabel={t("close")}
        onClose={() => setRevoke(null)}
      >
        <p>{revoke?.label}</p>
        <div className="actions">
          <Button
            variant="danger"
            loading={busy}
            onClick={() => {
              void remove();
            }}
          >
            {t("revoke")}
          </Button>
          <Button onClick={() => setRevoke(null)}>{t("cancel")}</Button>
        </div>
      </Dialog>
    </>
  );
}
