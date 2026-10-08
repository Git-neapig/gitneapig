import { Avatar } from "../../components/ui";
import { useLocale } from "../../lib/i18n";

export function AvatarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const { t } = useLocale();
  return (
    <fieldset className="avatar-picker">
      <legend>{t("avatar")}</legend>
      {["primary", "cream", "grey-white", "orange-black"].map((key) => (
        <label key={key} title={key}>
          <input
            type="radio"
            name="avatarPresetKey"
            value={key}
            checked={value === key}
            onChange={() => onChange(key)}
          />
          <Avatar src={`/mascots/characters/${key}/avatar.png`} alt={key} />
        </label>
      ))}
    </fieldset>
  );
}
