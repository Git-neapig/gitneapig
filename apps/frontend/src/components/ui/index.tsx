import { useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { Eye, EyeOff, Search, X, LoaderCircle } from "lucide-react";

import "./ui.css";

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`button button-${variant} button-${size} ${className}`}
    >
      {loading ? <LoaderCircle className="spin" size={18} aria-hidden /> : null}
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <Button
      {...props}
      variant="ghost"
      className={`icon-button ${props.className ?? ""}`}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}
export function TextInput({
  label,
  error,
  helper,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helper?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input
        {...props}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error || helper ? `${inputId}-help` : undefined}
      />
      {error || helper ? (
        <span
          id={`${inputId}-help`}
          className={error ? "field-error" : "muted"}
        >
          {error ?? helper}
        </span>
      ) : null}
    </div>
  );
}
export function PasswordInput({
  showLabel,
  hideLabel,
  ...props
}: Parameters<typeof TextInput>[0] & { showLabel: string; hideLabel: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <TextInput {...props} type={visible ? "text" : "password"} />
      <IconButton
        label={visible ? hideLabel : showLabel}
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </IconButton>
    </div>
  );
}
export function SearchInput({
  label,
  clearLabel,
  value,
  onChange,
}: {
  label: string;
  clearLabel: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="search-field">
      <Search size={18} aria-hidden />
      <TextInput
        label={label}
        type="search"
        value={value}
        maxLength={100}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <IconButton label={clearLabel} onClick={() => onChange("")}>
          <X size={16} />
        </IconButton>
      ) : null}
    </div>
  );
}
export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select {...props} id={id}>
        {children}
      </select>
    </div>
  );
}
