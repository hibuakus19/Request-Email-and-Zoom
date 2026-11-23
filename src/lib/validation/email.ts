import { TICKET_STATUSES, type TicketStatus } from "@/lib/tickets/constants";

export type EmailStatusUpdateField =
  "id" | "status" | "email" | "emailPassword";
export type EmailStatusUpdateErrors = Partial<
  Record<EmailStatusUpdateField, string>
>;

export type EmailStatusUpdateValidationResult =
  | {
      ok: true;
      value: {
        id: number;
        status: TicketStatus;
        email?: string;
        emailPassword?: string;
      };
    }
  | {
      ok: false;
      errors: EmailStatusUpdateErrors;
    };

/**
 * Validates the admin status update for an email ticket. The status must be
 * one of the contract values (`TICKET_STATUSES`); free-form text is rejected
 * on the server regardless of what the UI offers.
 */
export function validateEmailStatusUpdate(input: {
  id: string;
  status: string;
  email: string;
  emailPassword: string;
}): EmailStatusUpdateValidationResult {
  const errors: EmailStatusUpdateErrors = {};
  const id = Number(input.id);
  const status = input.status.trim().toUpperCase();
  const email = input.email.trim();
  const emailPassword = input.emailPassword;

  if (!Number.isInteger(id) || id <= 0) {
    errors.id = "Tiket tidak valid.";
  }

  if (!status) {
    errors.status = "Status wajib diisi.";
  } else if (!TICKET_STATUSES.includes(status as TicketStatus)) {
    errors.status = "Status tidak valid.";
  }

  if (email) {
    if (email.length > 100) {
      errors.email = "Email maksimal 100 karakter.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format email tidak valid.";
    }
  }

  if (emailPassword.length > 255) {
    errors.emailPassword = "Password maksimal 255 karakter.";
  } else if (email && !emailPassword) {
    errors.emailPassword = "Password default wajib diisi.";
  } else if (/\s/.test(emailPassword)) {
    errors.emailPassword = "Password tidak boleh mengandung spasi.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      id,
      status: status as TicketStatus,
      ...(email ? { email } : {}),
      ...(emailPassword ? { emailPassword } : {}),
    },
  };
}
