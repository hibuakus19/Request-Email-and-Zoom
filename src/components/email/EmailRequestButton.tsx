"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { KeyIcon, MailIcon } from "@/components/icons";
import SubmitButton from "@/components/SubmitButton";
import { Alert } from "@/components/ui";
import { requestEmailTicketAction } from "@/lib/actions/email";
import { initialFormState, type FormActionState } from "@/lib/actions/types";

type EmailRequestButtonProps = {
  hasEmail: boolean;
  /**
   * True when the latest email ticket of the employee is still `PENDING`.
   * Disables the submit button and explains why; the server rejects the
   * request independently of this flag.
   */
  hasPendingTicket: boolean;
};

export default function EmailRequestButton({
  hasEmail,
  hasPendingTicket,
}: EmailRequestButtonProps) {
  const [state, formAction] = useActionState<FormActionState, FormData>(
    requestEmailTicketAction,
    initialFormState,
  );
  const router = useRouter();
  const isSuccess = state.status === "success";
  const Icon = hasEmail ? KeyIcon : MailIcon;
  const disabled = hasPendingTicket || isSuccess;

  useEffect(() => {
    if (state.status === "success") {
      // Refresh the server-rendered profile so the latest request status shows.
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="space-y-3">
      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Pengajuan gagal">
          {state.message}
        </Alert>
      ) : null}

      {isSuccess && state.message ? (
        <Alert tone="success" title="Pengajuan terkirim">
          <p>{state.message}</p>
          {state.reference ? (
            <p className="mt-1 text-caption text-ink-soft">
              Nomor referensi:{" "}
              <span className="font-mono font-semibold">
                #{state.reference}
              </span>
            </p>
          ) : null}
        </Alert>
      ) : null}

      {hasPendingTicket ? (
        <Alert tone="info" title="Pengajuan sedang diproses">
          Anda masih memiliki pengajuan email berstatus Menunggu. Tunggu hingga
          pengajuan tersebut diproses oleh tim TI sebelum mengajukan kembali.
        </Alert>
      ) : null}

      <SubmitButton
        disabled={disabled}
        icon={<Icon size={17} />}
        pendingText="Mengirim pengajuan..."
      >
        {hasEmail ? "Request Reset Password" : "Request Email"}
      </SubmitButton>

      {isSuccess ? (
        <p className="text-center text-caption leading-relaxed text-muted">
          Pengajuan sudah terkirim. Hindari pengiriman ganda.
        </p>
      ) : null}
    </form>
  );
}
