"use client";

import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { EditIcon, LinkIcon } from "@/components/icons";
import SubmitButton from "@/components/SubmitButton";
import { Alert, FieldError } from "@/components/ui";
import LockedLabel from "@/components/ui/LockedLabel";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import {
  helperClassName,
  inputClassName,
  labelClassName,
  selectClassName,
  textareaClassName,
} from "@/components/ui/form-styles";
import { updateZoomTicketAction } from "@/lib/actions/zoom";
import { initialFormState, type FormActionState } from "@/lib/actions/types";
import { isFinalTicketStatus, TICKET_STATUSES } from "@/lib/tickets/constants";
import { formatTicketStatus } from "@/lib/tickets/format";
import type { ZoomTicketView } from "@/lib/tickets/types";

type ZoomTicketEditorProps = {
  ticket: ZoomTicketView;
};

export default function ZoomTicketEditor({ ticket }: ZoomTicketEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [instance, setInstance] = useState(0);
  const router = useRouter();
  const titleId = `zoom-editor-title-${ticket.id}`;

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
        aria-label={`Kelola tiket Zoom ${ticket.karyawan.nama}`}
      >
        <EditIcon size={14} />
        Kelola
      </Button>

      <Dialog
        dialogRef={dialogRef}
        titleId={titleId}
        eyebrow={`Tiket #${ticket.id}`}
        title="Kelola permintaan Zoom"
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
  ticket: ZoomTicketView;
  onSuccess: () => void;
  onCancel: () => void;
};

function EditorForm({ ticket, onSuccess, onCancel }: EditorFormProps) {
  const [state, formAction] = useActionState<FormActionState, FormData>(
    updateZoomTicketAction,
    initialFormState,
  );
  const zoomLinkId = `zoom-link-${ticket.id}`;
  const statusId = `zoom-status-${ticket.id}`;
  const reasonId = `zoom-reason-${ticket.id}`;
  const zoomLinkError = state.fieldErrors?.zoomLink;
  const statusError = state.fieldErrors?.status;
  const reasonError = state.fieldErrors?.alasanDitolak;

  const currentStatus = TICKET_STATUSES.includes(
    ticket.status as (typeof TICKET_STATUSES)[number],
  )
    ? ticket.status
    : TICKET_STATUSES[0];
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const isRejected = selectedStatus === "REJECTED";

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
          {ticket.description}
        </p>
      </div>

      {isRejected ? null : (
        <div>
          <label htmlFor={zoomLinkId} className={labelClassName}>
            Tautan Zoom
          </label>
          <input
            id={zoomLinkId}
            name="zoomLink"
            type="url"
            inputMode="url"
            defaultValue={ticket.zoomLink ?? ""}
            placeholder="https://zoom.us/j/123456789"
            aria-invalid={zoomLinkError ? true : undefined}
            aria-describedby={
              zoomLinkError ? `${zoomLinkId}-error` : `${zoomLinkId}-help`
            }
            className={`${inputClassName} mt-2`}
          />
          <FieldError id={`${zoomLinkId}-error`}>{zoomLinkError}</FieldError>
          <p id={`${zoomLinkId}-help`} className={helperClassName}>
            Kosongkan jika tautan belum tersedia. Gunakan URL http:// atau
            https://.
          </p>
        </div>
      )}

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

      {isRejected ? (
        <div>
          <label htmlFor={reasonId} className={labelClassName}>
            Alasan penolakan
          </label>
          <textarea
            id={reasonId}
            name="alasanDitolak"
            rows={3}
            maxLength={255}
            defaultValue={ticket.alasanDitolak ?? ""}
            placeholder="Contoh: Jadwal ruang Zoom sudah terisi pada waktu yang diminta."
            aria-invalid={reasonError ? true : undefined}
            aria-describedby={
              reasonError ? `${reasonId}-error` : `${reasonId}-help`
            }
            className={`${textareaClassName} mt-2 min-h-[96px]`}
          />
          <FieldError id={`${reasonId}-error`}>{reasonError}</FieldError>
          <p id={`${reasonId}-help`} className={helperClassName}>
            Alasan ini akan tampil kepada karyawan. Maksimal 255 karakter.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="md" onClick={onCancel}>
          Batal
        </Button>
        <SubmitButton
          fullWidth={false}
          icon={<LinkIcon size={16} />}
          pendingText="Menyimpan..."
          className="sm:min-w-[164px]"
        >
          Simpan perubahan
        </SubmitButton>
      </div>
    </form>
  );
}
