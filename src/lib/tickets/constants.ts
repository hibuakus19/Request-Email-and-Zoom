/**
 * Application contract values for `email_ticket.request`.
 *
 * The database only documents the column as VARCHAR(25), so these values are
 * an application-level contract. Confirm them with the backend before writing
 * production data.
 */
export const EMAIL_REQUEST = {
  CREATE: "CREATE_EMAIL",
  RESET: "RESET_PASSWORD",
} as const;

export type EmailRequestKind =
  (typeof EMAIL_REQUEST)[keyof typeof EMAIL_REQUEST];

export const EMAIL_REQUEST_MAX_LENGTH = 25;
export const TICKET_STATUS_MAX_LENGTH = 25;
export const ZOOM_DESCRIPTION_MAX_LENGTH = 255;
export const ZOOM_LETTER_LINK_MAX_LENGTH = 255;

/**
 * Application contract for `email_ticket.status` and `zoom_ticket.status`.
 * Both editors only offer these values and both server actions reject any
 * other value. `formatTicketStatus` still renders unknown legacy values
 * gracefully so old rows never break rendering.
 */
export const TICKET_STATUSES = ["PENDING", "REJECTED", "DONE"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

/**
 * Statuses that lock a ticket: `DONE` (selesai) and `REJECTED` (ditolak).
 * Final tickets cannot be edited by admins, enforced on the server.
 */
export const FINAL_TICKET_STATUSES = ["DONE", "REJECTED"] as const;

export function isFinalTicketStatus(status: string) {
  return (FINAL_TICKET_STATUSES as readonly string[]).includes(
    status.trim().toUpperCase(),
  );
}

/** Rows per page for the admin request tables. */
export const TICKET_PAGE_SIZE = 10;

export const APP_TIME_ZONE = "Asia/Jakarta";
