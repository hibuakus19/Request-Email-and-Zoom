"use client";

import { useCallback, useRef, useState } from "react";
import { ExternalLinkIcon } from "@/components/icons";
import { StatusBadge } from "@/components/ui";
import Dialog from "@/components/ui/Dialog";
import {
  formatDateTime,
  formatEventDateTime,
  isHttpUrl,
} from "@/lib/tickets/format";
import type { ZoomTicketView } from "@/lib/tickets/types";

type ZoomTicketCardProps = {
  ticket: ZoomTicketView;
};

export default function ZoomTicketCard({ ticket }: ZoomTicketCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const titleId = `zoom-ticket-detail-title-${ticket.id}`;

  const open = useCallback(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
      setIsOpen(true);
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={`zoom-ticket-detail-${ticket.id}`}
        aria-label={`Buka detail tiket Zoom nomor ${ticket.id}`}
        className="w-full rounded-xl border border-line bg-paper/60 p-3 text-left transition-colors hover:border-success/30 hover:bg-success-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-badge text-muted">
            Tiket #{ticket.id}
          </span>
          <StatusBadge value={ticket.status} />
        </span>

        <span className="mt-2 block line-clamp-2 text-small leading-relaxed text-ink-soft">
          {ticket.description}
        </span>

        <span className="mt-3 block border-t border-line pt-3 text-caption">
          <span className="font-semibold text-muted">Tanggal dan waktu</span>
          <span className="mt-1 block text-left font-medium text-ink-soft">
            {formatEventDateTime(ticket.date)}
          </span>
        </span>
      </button>

      <Dialog
        dialogRef={dialogRef}
        id={`zoom-ticket-detail-${ticket.id}`}
        titleId={titleId}
        eyebrow={`Tiket #${ticket.id}`}
        title="Detail permintaan Zoom"
        tone="success"
        closeLabel="Tutup detail tiket"
        onClose={() => setIsOpen(false)}
      >
        <dl className="space-y-4 text-body-sm">
          <div>
            <dt className="font-medium text-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge value={ticket.status} />
            </dd>
          </div>
          {ticket.status === "REJECTED" && ticket.alasanDitolak ? (
            <div>
              <dt className="font-medium text-muted">Alasan penolakan</dt>
              <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-danger">
                {ticket.alasanDitolak}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-muted">Deskripsi meeting</dt>
            <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-ink">
              {ticket.description}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted">Tanggal dan waktu acara</dt>
            <dd className="mt-1 text-ink">
              {formatEventDateTime(ticket.date)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted">Diajukan pada</dt>
            <dd className="mt-1 text-ink">
              {formatDateTime(ticket.createdAt)}
            </dd>
          </div>
          {ticket.status !== "REJECTED" ? (
            <div>
              <dt className="font-medium text-muted">Tautan Zoom</dt>
              <dd className="mt-1">
                {ticket.zoomLink ? (
                  <a
                    href={ticket.zoomLink}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex max-w-full items-center gap-1.5 break-all font-semibold text-info hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
                  >
                    <span>{ticket.zoomLink}</span>
                    <ExternalLinkIcon size={14} className="shrink-0" />
                  </a>
                ) : (
                  <span className="text-muted">Belum tersedia</span>
                )}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-muted">Link surat perintah</dt>
            <dd className="mt-1">
              {ticket.linkSurat && isHttpUrl(ticket.linkSurat) ? (
                <a
                  href={ticket.linkSurat}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex max-w-full items-center gap-1.5 break-all font-semibold text-info hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
                >
                  <span>{ticket.linkSurat}</span>
                  <ExternalLinkIcon size={14} className="shrink-0" />
                </a>
              ) : (
                <span className="text-muted">
                  {ticket.linkSurat ? "Tautan tidak valid" : "Belum tersedia"}
                </span>
              )}
            </dd>
          </div>
        </dl>
      </Dialog>
    </>
  );
}
