import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import type { Language, LocalizedText } from "@gitneapig/shared";
import { commonWords } from "./locales/common";
import { learningWords } from "./locales/learning";
import { accountWords } from "./locales/account";
import { referenceWords } from "./locales/reference";
const words = {
  ...commonWords,
  ...learningWords,
  ...accountWords,
  ...referenceWords,
};
const resources = Object.fromEntries(
  (["ko", "en", "ja"] as Language[]).map((language, index) => [
    language,
    {
      translation: Object.fromEntries(
        Object.entries(words).map(([key, values]) => [key, values[index]]),
      ),
    },
  ]),
);
let preferred = "ko";
try {
  preferred = localStorage.getItem("gitneapig-language-v1") ?? "ko";
} catch {
  /* Storage can be disabled. */
}
void i18n.use(initReactI18next).init({
  resources,
  lng: ["ko", "en", "ja"].includes(preferred) ? preferred : "ko",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
export function useLocale() {
  const { t, i18n: instance } = useTranslation();
  const language = (instance.resolvedLanguage ?? "ko") as Language;
  return {
    t,
    language,
    text: (value: LocalizedText) => value[language] ?? value.en,
  };
}
export { resources };
export default i18n;
