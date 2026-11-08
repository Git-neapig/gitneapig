import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useLocale } from "../lib/i18n";
import { Button } from "./ui";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export function PwaControls() {
  const { t } = useLocale(),
    [install, setInstall] = useState<InstallEvent | null>(null);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  useEffect(() => {
    const ready = (event: Event) => {
        event.preventDefault();
        setInstall(event as InstallEvent);
      },
      done = () => setInstall(null);
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  if (!install && !needRefresh) return null;
  return (
    <aside className="pwa-notice" aria-live="polite">
      {needRefresh ? (
        <>
          <span>{t("updateReady")}</span>
          <Button
            onClick={() => {
              void updateServiceWorker(true);
            }}
          >
            <RefreshCw size={16} />
            {t("update")}
          </Button>
          <Button onClick={() => setNeedRefresh(false)}>{t("close")}</Button>
        </>
      ) : (
        <Button
          onClick={() => {
            if (install)
              void install
                .prompt()
                .then(() => install.userChoice)
                .finally(() => setInstall(null));
          }}
        >
          <Download size={16} />
          {t("install")}
        </Button>
      )}
    </aside>
  );
}
