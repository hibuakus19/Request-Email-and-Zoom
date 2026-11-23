import { APP_TIME_ZONE } from "./constants";

export type BadgeTone =
  "accent" | "info" | "success" | "warning" | "danger" | "neutral";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

const eventDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  hourCycle: "h23",
});

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return dateTimeFormatter.format(date);
}

/** Formats a timezone-free Jakarta wall-clock value without shifting its time. */
export function formatEventDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return "—";
  }

  const [, year, month, day, hour, minute] = match;
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ),
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day) ||
    date.getUTCHours() !== Number(hour) ||
    date.getUTCMinutes() !== Number(minute)
  ) {
    return "—";
  }

  return `${eventDateTimeFormatter.format(date)} WIB`;
}

export function formatEmailRequest(value: string): {
  label: string;
  tone: BadgeTone;
} {
  const normalized = value.trim().toUpperCase();

  if (normalized.includes("RESET")) {
    return { label: "Reset Password", tone: "info" };
  }

  if (
    normalized.includes("CREATE") ||
    normalized.includes("BUAT") ||
    normalized.includes("BARU")
  ) {
    return { label: "Pembuatan Email", tone: "accent" };
  }

  return {
    label: value.trim() ? toTitleCase(value) : "—",
    tone: "neutral",
  };
}

export function formatTicketStatus(value: string): {
  label: string;
  tone: BadgeTone;
} {
  const normalized = value.trim().toUpperCase();

  switch (normalized) {
    case "PENDING":
      return { label: "Menunggu", tone: "warning" };
    case "REJECTED":
      return { label: "Ditolak", tone: "danger" };
    case "DONE":
      return { label: "Selesai", tone: "success" };
    default:
      return {
        label: value.trim() ? toTitleCase(value) : "—",
        tone: "neutral",
      };
  }
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const AVATAR_TONES = [
  "bg-accent-soft text-accent-ink ring-accent/10",
  "bg-success-soft text-success ring-success/10",
  "bg-warning-soft text-warning ring-warning/10",
  "bg-info-soft text-info ring-info/10",
  "bg-danger-soft text-danger ring-danger/10",
] as const;

/**
 * Picks a stable avatar color for an employee from their NIP, so rows of
 * different employees look different while the same employee keeps one color.
 */
export function getAvatarTone(nip: string) {
  let hash = 0;

  for (const char of nip) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
