import {
  APP_TIME_ZONE,
  TICKET_STATUSES,
  ZOOM_DESCRIPTION_MAX_LENGTH,
  ZOOM_LETTER_LINK_MAX_LENGTH,
} from "@/lib/tickets/constants";
import { isHttpUrl } from "@/lib/tickets/format";
import type { TicketStatus } from "@/lib/tickets/constants";

const localDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function getCurrentDateTimeLocal(now = new Date()) {
  // datetime-local inputs have minute precision. Round up so the browser and
  // server both reject a time that has already started in the current minute.
  const roundedNow = new Date(Math.ceil(now.getTime() / 60_000) * 60_000);
  const parts = localDateTimeFormatter.formatToParts(roundedNow);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function isValidISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidISOLocalDateTime(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  return Boolean(match && isValidISODate(match[1]));
}

export type ZoomRequestField = "description" | "date" | "linkSurat";
export type ZoomRequestErrors = Partial<Record<ZoomRequestField, string>>;

export type ZoomRequestValidationResult =
  | {
      ok: true;
      value: {
        description: string;
        /** Local Asia/Jakarta date and time, formatted as YYYY-MM-DDTHH:mm. */
        date: string;
        linkSurat: string | null;
      };
    }
  | {
      ok: false;
      errors: ZoomRequestErrors;
    };

export function validateZoomRequest(
  input: { description: string; date: string; linkSurat: string },
  options: { now?: Date } = {},
): ZoomRequestValidationResult {
  const errors: ZoomRequestErrors = {};
  const description = input.description.trim();
  const date = input.date.trim();
  const linkSurat = input.linkSurat.trim();
  const minimumDateTime = getCurrentDateTimeLocal(options.now);

  if (!description) {
    errors.description = "Deskripsi meeting wajib diisi.";
  } else if (description.length > ZOOM_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Deskripsi maksimal ${ZOOM_DESCRIPTION_MAX_LENGTH} karakter.`;
  }

  if (!date) {
    errors.date = "Tanggal dan waktu acara wajib diisi.";
  } else if (!isValidISOLocalDateTime(date)) {
    errors.date = "Format tanggal dan waktu tidak valid.";
  } else if (date < minimumDateTime) {
    errors.date = "Tanggal dan waktu acara tidak boleh di masa lalu.";
  }

  if (linkSurat.length > ZOOM_LETTER_LINK_MAX_LENGTH) {
    errors.linkSurat = `Link surat perintah maksimal ${ZOOM_LETTER_LINK_MAX_LENGTH} karakter.`;
  } else if (linkSurat && !isHttpUrl(linkSurat)) {
    errors.linkSurat =
      "Link surat perintah harus berupa URL valid yang diawali http:// atau https://.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { description, date, linkSurat: linkSurat || null },
  };
}

export type ZoomUpdateField = "id" | "zoomLink" | "status" | "alasanDitolak";
export type ZoomUpdateErrors = Partial<Record<ZoomUpdateField, string>>;

export type ZoomUpdateValidationResult =
  | {
      ok: true;
      value: {
        id: number;
        zoomLink: string | null;
        status: TicketStatus;
        alasanDitolak: string | null;
      };
    }
  | {
      ok: false;
      errors: ZoomUpdateErrors;
    };

export function validateZoomUpdate(input: {
  id: string;
  zoomLink: string;
  status: string;
  alasanDitolak: string;
}): ZoomUpdateValidationResult {
  const errors: ZoomUpdateErrors = {};
  const id = Number(input.id);
  const zoomLink = input.zoomLink.trim();
  const status = input.status.trim().toUpperCase();
  const alasanDitolak = input.alasanDitolak.trim();
  const isRejected = status === "REJECTED";

  if (!Number.isInteger(id) || id <= 0) {
    errors.id = "Tiket tidak valid.";
  }

  if (!status) {
    errors.status = "Status wajib diisi.";
  } else if (!TICKET_STATUSES.includes(status as TicketStatus)) {
    errors.status = "Status tidak valid. Gunakan PENDING, REJECTED, atau DONE.";
  }

  if (isRejected) {
    if (!alasanDitolak) {
      errors.alasanDitolak = "Alasan penolakan wajib diisi.";
    } else if (alasanDitolak.length > 255) {
      errors.alasanDitolak = "Alasan penolakan maksimal 255 karakter.";
    }
  } else if (zoomLink && !isHttpUrl(zoomLink)) {
    errors.zoomLink =
      "Tautan Zoom harus berupa URL yang valid dan diawali http:// atau https://.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      id,
      zoomLink: isRejected ? null : zoomLink || null,
      status: status as TicketStatus,
      alasanDitolak: isRejected ? alasanDitolak : null,
    },
  };
}
