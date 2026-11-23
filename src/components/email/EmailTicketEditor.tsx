"use client";

import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EditIcon } from "@/components/icons";
import PasswordInput from "@/components/PasswordInput";
import SubmitButton from "@/components/SubmitButton";
import { Alert, FieldError } from "@/components/ui";
import LockedLabel from "@/components/ui/LockedLabel";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import {
  inputClassName,
  helperClassName,
  labelClassName,
  selectClassName,
} from "@/components/ui/form-styles";
import { updateEmailTicketStatusAction } from "@/lib/actions/email";
import { initialFormState, type FormActionState } from "@/lib/actions/types";
import {
  EMAIL_REQUEST,
  isFinalTicketStatus,
  TICKET_STATUSES,
} from "@/lib/tickets/constants";
import { formatTicketStatus } from "@/lib/tickets/format";
import type { EmailTicketView } from "@/lib/tickets/types";

type EmailTicketEditorProps = {
  ticket: EmailTicketView;
};

export default function EmailTicketEditor({ ticket }: EmailTicketEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [instance, setInstance] = useState(0);
  const router = useRouter();
  const titleId = `email-editor-title-${ticket.id}`;

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const open = useCallback(() => {
    setInstance((value) => value + 1);
    setIsOpen(true);
    dialogRef.current?.showModal();
  }, []);

  const handleSuccess = useCallback(() => {
    close();
    router.refresh();
  }, [close, router]);

  if (isFinalTicketStatus(ticket.status)) {
    return <LockedLabel />;
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={open}
        aria-label={`Kelola tiket email ${ticket.karyawan.nama}`}
      >
        <EditIcon size={14} />
        Kelola
      </Button>

      <Dialog
        dialogRef={dialogRef}
        titleId={titleId}
        eyebrow={`Tiket #${ticket.id}`}
        title="Kelola status tiket email"
        onClose={() => setIsOpen(false)}
      >
        {isOpen ? (
          <EditorForm
            key={`${ticket.id}-${instance}`}
            ticket={ticket}
            onSuccess={handleSuccess}
            onCancel={close}
          />
        ) : null}
      </Dialog>
    </>
  );
}

type EditorFormProps = {
  ticket: EmailTicketView;
  onSuccess: () => void;
  onCancel: () => void;
};

function EditorForm({ ticket, onSuccess, onCancel }: EditorFormProps) {
  const [state, formAction] = useActionState<FormActionState, FormData>(
    updateEmailTicketStatusAction,
    initialFormState,
  );
  const statusId = `email-status-${ticket.id}`;
  const statusError = state.fieldErrors?.status;
  const emailId = `email-address-${ticket.id}`;
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.emailPassword;
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const isResetRequest =
    ticket.request.trim().toUpperCase() === EMAIL_REQUEST.RESET;
  const showCredentialFields =
    ticket.request.trim().toUpperCase() === EMAIL_REQUEST.CREATE &&
    ticket.status !== "DONE";
  const showResetPasswordField = isResetRequest && ticket.status !== "DONE";
  const isDone = selectedStatus === "DONE";

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
    }
  }, [onSuccess, state]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={ticket.id} />

      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Perubahan gagal">
          {state.message}
        </Alert>
      ) : null}

      <div className="rounded-xl border border-line bg-paper/70 p-3.5">
        <p className="text-caption font-semibold text-ink">
          {ticket.karyawan.nama}{" "}
          <span className="font-normal text-muted">· NIP {ticket.nip}</span>
        </p>
        <p className="mt-1 text-caption leading-relaxed text-ink-soft">
          {ticket.karyawan.email
            ? `Email saat ini: ${ticket.karyawan.email}`
            : "Karyawan belum memiliki email kantor."}
        </p>
      </div>

      {showCredentialFields ? (
        <section className="space-y-4 rounded-xl border border-accent/15 bg-accent-soft/35 p-4">
          <div>
            <h3 className="text-label font-semibold text-ink">
              Kredensial email baru
            </h3>
            <p className="mt-1 text-caption leading-relaxed text-ink-soft">
              Isi email dan password default di sini. Kredensial akan disimpan
              saat status diubah menjadi Selesai.
            </p>
          </div>

          <div>
            <label htmlFor={emailId} className={labelClassName}>
              Email karyawan
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              required={isDone}
              maxLength={100}
              defaultValue={ticket.karyawan.email ?? ""}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={
                emailError ? `${emailId}-error` : `${emailId}-help`
              }
              className={`${inputClassName} mt-2`}
            />
            {emailError ? (
              <FieldError id={`${emailId}-error`}>{emailError}</FieldError>
            ) : (
              <p id={`${emailId}-help`} className={helperClassName}>
                Email ini akan tampil di profil karyawan setelah request
                selesai.
              </p>
            )}
          </div>

          <EmailPasswordField
            id={`email-password-${ticket.id}`}
            label="Password default"
            placeholder="Masukkan password default"
            helpText="Wajib diisi saat menyelesaikan request. Password disimpan terpisah dari password login aplikasi."
            required={isDone}
            error={passwordError}
          />
        </section>
      ) : null}

      {showResetPasswordField ? (
        <section className="space-y-4 rounded-xl border border-accent/15 bg-accent-soft/35 p-4">
          <div>
            <h3 className="text-label font-semibold text-ink">Password baru</h3>
            <p className="mt-1 text-caption leading-relaxed text-ink-soft">
              Isi password baru untuk email karyawan. Password akan disimpan
              saat status diubah menjadi Selesai.
            </p>
          </div>

          <EmailPasswordField
            id={`email-password-${ticket.id}`}
            label="Password baru"
            placeholder="Masukkan password baru"
            helpText="Password disimpan terpisah dari password login aplikasi."
            required={isDone}
            error={passwordError}
          />
        </section>
      ) : null}

      <div>
        <label htmlFor={statusId} className={labelClassName}>
          Status permintaan
        </label>
        <select
          id={statusId}
          name="status"
          required
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
          aria-invalid={statusError ? true : undefined}
          aria-describedby={
            statusError ? `${statusId}-error` : `${statusId}-help`
          }
          className={`${selectClassName} mt-2`}
        >
          {TICKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatTicketStatus(status).label}
            </option>
          ))}
        </select>
        <FieldError id={`${statusId}-error`}>{statusError}</FieldError>
        <p id={`${statusId}-help`} className={helperClassName}>
          Status tiket hanya menerima nilai dari daftar di atas.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="md" onClick={onCancel}>
          Batal
        </Button>
        <SubmitButton
          fullWidth={false}
          icon={<EditIcon size={16} />}
          pendingText="Menyimpan..."
          className="sm:min-w-[164px]"
        >
          Simpan perubahan
        </SubmitButton>
      </div>
    </form>
  );
}

type EmailPasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  helpText: string;
  required: boolean;
  error?: string;
};

function EmailPasswordField({
  id,
  label,
  placeholder,
  helpText,
  required,
  error,
}: EmailPasswordFieldProps) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="mt-2">
        <PasswordInput
          id={id}
          name="emailPassword"
          placeholder={placeholder}
          autoComplete="new-password"
          required={required}
          noSpaces
          invalid={Boolean(error)}
          describedBy={error ? errorId : helpId}
        />
      </div>
      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : (
        <p id={helpId} className={helperClassName}>
          {helpText}
        </p>
      )}
    </div>
  );
}
