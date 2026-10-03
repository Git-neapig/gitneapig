import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import {
  Eye,
  EyeOff,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./ui.css";

type Tone =
  "neutral" | "primary" | "success" | "warning" | "danger" | "info" | "locked";
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
export function Card({
  variant = "default",
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "interactive" | "selected" | "locked" | "success";
}) {
  return <div {...props} className={`card card-${variant} ${className}`} />;
}
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return <span className={`badge tone-${tone}`}>{children}</span>;
}
export function Tabs({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div role="tablist" aria-label={label} className="tabs">
      {items.map((item, i) => (
        <button
          key={item.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          tabIndex={value === item.value ? 0 : -1}
          onClick={() => onChange(item.value)}
          onKeyDown={(e) => {
            let next = i;
            if (e.key === "ArrowRight") next = (i + 1) % items.length;
            else if (e.key === "ArrowLeft")
              next = (i - 1 + items.length) % items.length;
            else if (e.key === "Home") next = 0;
            else if (e.key === "End") next = items.length - 1;
            else return;
            e.preventDefault();
            onChange(items[next].value);
            refs.current[next]?.focus();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const bounded = Math.min(100, Math.max(0, value));
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={bounded}
    >
      <span style={{ width: `${bounded}%` }} />
    </div>
  );
}
export function Dialog({
  open,
  title,
  onClose,
  closeLabel,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const trigger = document.activeElement as HTMLElement | null;
    el.showModal();
    return () => {
      el.close();
      trigger?.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <IconButton label={closeLabel} onClick={onClose}>
          <X size={20} />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="tooltip" tabIndex={0} aria-label={label}>
      {children}
      <span role="tooltip">{label}</span>
    </span>
  );
}
export function Alert({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`alert tone-${tone}`}
    >
      {children}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {description ? <p className="muted">{description}</p> : null}
      {children}
    </div>
  );
}
export function Skeleton({ label }: { label: string }) {
  return (
    <div aria-label={label} role="status" className="skeleton">
      <span />
      <span />
      <span />
    </div>
  );
}
export function Breadcrumb({
  items,
}: {
  items: { label: string; to?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i ? " / " : ""}
          {item.to ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function Pagination({
  page,
  pages,
  onChange,
  previousLabel,
  nextLabel,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
}) {
  return (
    <nav className="pagination">
      <IconButton
        label={previousLabel}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={18} />
      </IconButton>
      <span>
        {page} / {Math.max(1, pages)}
      </span>
      <IconButton
        label={nextLabel}
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={18} />
      </IconButton>
    </nav>
  );
}
export const defaultAvatar = "/mascots/characters/primary/avatar-white.png";
export function Avatar({
  src = defaultAvatar,
  alt,
  size = "md",
}: {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <img
      src={src.replace(
        /^(\/mascots\/characters\/(?:primary|cream|grey-white|orange-black))\/avatar\.png$/,
        "$1/avatar-white.png",
      )}
      alt={alt}
      className={`avatar avatar-${size}`}
      onError={(e) => {
        if (!e.currentTarget.src.endsWith(defaultAvatar))
          e.currentTarget.src = defaultAvatar;
      }}
    />
  );
}
export function StatusDot({
  online,
  label,
}: {
  online: boolean;
  label: string;
}) {
  return (
    <span className="status">
      <i className={online ? "online" : ""} aria-hidden />
      {label}
    </span>
  );
}
