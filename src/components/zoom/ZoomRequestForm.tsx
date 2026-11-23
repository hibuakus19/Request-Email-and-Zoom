"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { VideoIcon } from "@/components/icons";
import SubmitButton from "@/components/SubmitButton";
import { Alert, FieldError } from "@/components/ui";
import {
  inputClassName,
  labelClassName,
  textareaClassName,
} from "@/components/ui/form-styles";
import { createZoomTicketAction } from "@/lib/actions/zoom";
import { initialFormState, type FormActionState } from "@/lib/actions/types";
import {
  ZOOM_DESCRIPTION_MAX_LENGTH,
  ZOOM_LETTER_LINK_MAX_LENGTH,
} from "@/lib/tickets/constants";

type ZoomRequestFormProps = {
  minDateTime: string;
};

export default function ZoomRequestForm({ minDateTime }: ZoomRequestFormProps) {
  const [state, formAction, pending] = useActionState<
    FormActionState,
    FormData
  >(createZoomTicketAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const linkSuratRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      // Resetting the DOM form keeps the form ready for the next Zoom ticket
      // without introducing a derived state update in an effect.
      formRef.current?.reset();
      // Refresh the server-rendered status card with the latest ticket.
      router.refresh();
    }
  }, [router, state]);

  useEffect(() => {
    if (state.status !== "error") {
      return;
    }

    if (state.fieldErrors?.description) {
      descriptionRef.current?.focus();
    } else if (state.fieldErrors?.date) {
      dateRef.current?.focus();
    } else if (state.fieldErrors?.linkSurat) {
      linkSuratRef.current?.focus();
    }
  }, [state]);

  const descriptionError = state.fieldErrors?.description;
  const dateError = state.fieldErrors?.date;
  const linkSuratError = state.fieldErrors?.linkSurat;

  return (
    <form ref={formRef} action={formAction} className="space-y-5 lg:space-y-3">
      {state.status === "error" && state.message ? (
        <Alert tone="error" title="Pengajuan gagal">
          {state.message}
        </Alert>
      ) : null}

      {state.status === "success" && state.message ? (
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

      <div>
        <label htmlFor="zoom-description" className={labelClassName}>
          Deskripsi meeting
        </label>
        <textarea
          ref={descriptionRef}
          id="zoom-description"
          name="description"
          required
          disabled={pending}
          maxLength={ZOOM_DESCRIPTION_MAX_LENGTH}
          rows={4}
          aria-invalid={descriptionError ? true : undefined}
          aria-describedby={
            descriptionError
              ? "zoom-description-help zoom-description-error"
              : "zoom-description-help"
          }
          placeholder="Contoh: Rapat koordinasi bulanan divisi keuangan bersama seluruh kepala unit."
          className={`${textareaClassName} mt-2 lg:mt-1.5 lg:min-h-[96px]`}
        />
        <FieldError id="zoom-description-error">{descriptionError}</FieldError>
      </div>

      <div>
        <label htmlFor="zoom-date" className={labelClassName}>
          Tanggal dan waktu Meeting
        </label>
        <input
          ref={dateRef}
          id="zoom-date"
          name="date"
          type="datetime-local"
          required
          disabled={pending}
          min={minDateTime}
          aria-invalid={dateError ? true : undefined}
          aria-describedby={
            dateError ? "zoom-date-help zoom-date-error" : "zoom-date-help"
          }
          className={`${inputClassName} mt-2 lg:mt-1.5`}
        />
        <FieldError id="zoom-date-error">{dateError}</FieldError>
      </div>

      <div>
        <label htmlFor="zoom-link-surat" className={labelClassName}>
          Link surat perintah{" "}
          <span className="font-normal text-muted">(opsional)</span>
        </label>
        <input
          ref={linkSuratRef}
          id="zoom-link-surat"
          name="linkSurat"
          type="url"
          disabled={pending}
          maxLength={ZOOM_LETTER_LINK_MAX_LENGTH}
          autoComplete="url"
          aria-invalid={linkSuratError ? true : undefined}
          aria-describedby={
            linkSuratError
              ? "zoom-link-surat-help zoom-link-surat-error"
              : "zoom-link-surat-help"
          }
          placeholder="https://..."
          className={`${inputClassName} mt-2 lg:mt-1.5`}
        />
        <FieldError id="zoom-link-surat-error">{linkSuratError}</FieldError>
      </div>

      <div className="pt-1">
        <SubmitButton
          icon={<VideoIcon size={17} />}
          pendingText="Mengirim pengajuan..."
        >
          Kirim pengajuan Zoom
        </SubmitButton>
        <p className="mt-3 text-center text-caption leading-relaxed text-muted lg:mt-1.5">
          Satu pengajuan berlaku untuk satu sesi meeting. Anda dapat mengajukan
          permintaan lain setelah pengajuan ini terkirim.
        </p>
      </div>
    </form>
  );
}
