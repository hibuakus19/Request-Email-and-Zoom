import type { ReactNode } from "react";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  InboxIcon,
  InfoIcon,
  WarningIcon,
} from "@/components/icons";
import {
  formatEmailRequest,
  formatTicketStatus,
  type BadgeTone,
} from "@/lib/tickets/format";
import { errorClassName } from "./form-styles";

/* ---------------------------------- Alert --------------------------------- */

export type AlertTone = "success" | "error" | "info" | "warning";

const alertToneStyles: Record<
  AlertTone,
  { container: string; icon: string; title: string }
> = {
  success: {
    container: "border-success/25 bg-success-soft",
    icon: "bg-success text-white",
    title: "text-success",
  },
  error: {
    container: "border-danger/25 bg-danger-soft",
    icon: "bg-danger text-white",
    title: "text-danger",
  },
  info: {
    container: "border-info/20 bg-info-soft",
    icon: "bg-info text-white",
    title: "text-info",
  },
  warning: {
    container: "border-warning/25 bg-warning-soft",
    icon: "bg-warning text-white",
    title: "text-warning",
  },
};

const alertToneIcons = {
  success: CheckCircleIcon,
  error: AlertCircleIcon,
  info: InfoIcon,
  warning: WarningIcon,
};

type AlertProps = {
  tone: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Alert({ tone, title, children, className = "" }: AlertProps) {
  const styles = alertToneStyles[tone];
  const Icon = alertToneIcons[tone];
  const role = tone === "error" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-body-sm leading-relaxed text-ink ${styles.container} ${className}`}
    >
      <span
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        {title ? (
          <p className={`mb-0.5 text-body-sm font-semibold ${styles.title}`}>
            {title}
          </p>
        ) : null}
        <div className="text-ink-soft [overflow-wrap:anywhere]">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------- FieldError ------------------------------- */

type FieldErrorProps = {
  id?: string;
  children?: ReactNode;
};

export function FieldError({ id, children }: FieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p id={id} className={errorClassName}>
      <AlertCircleIcon size={14} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/* -------------------------------- EmptyState ------------------------------- */

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-14 text-center sm:py-16 ${className}`}
    >
      <div className="grid size-14 place-items-center rounded-2xl border border-line bg-paper text-muted">
        {icon ?? <InboxIcon size={26} />}
      </div>
      <h3 className="mt-4 text-title-xs font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-body-sm leading-relaxed text-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* -------------------------------- PageHeader ------------------------------- */

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-eyebrow font-bold uppercase tracking-[0.18em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1.5 text-pretty text-display leading-tight font-semibold tracking-[-0.035em] text-ink sm:text-display-lg">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-pretty text-body leading-relaxed text-ink-soft">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------- StatusBadge ------------------------------ */

const badgeToneStyles: Record<BadgeTone, string> = {
  accent: "border-accent/20 bg-accent-soft text-accent-ink",
  info: "border-info/20 bg-info-soft text-info",
  success: "border-success/25 bg-success-soft text-success",
  warning: "border-warning/25 bg-warning-soft text-warning",
  danger: "border-danger/25 bg-danger-soft text-danger",
  neutral: "border-line bg-paper-deep text-ink-soft",
};

type StatusBadgeProps = {
  value: string;
  kind?: "status" | "request";
  className?: string;
};

export function StatusBadge({
  value,
  kind = "status",
  className = "",
}: StatusBadgeProps) {
  const formatted =
    kind === "request" ? formatEmailRequest(value) : formatTicketStatus(value);

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-badge font-semibold leading-none whitespace-nowrap ${badgeToneStyles[formatted.tone]} ${className}`}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current"
      />
      {formatted.label}
    </span>
  );
}
