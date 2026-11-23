"use client";

import { useRef, useState } from "react";
import { InfoIcon } from "@/components/icons";
import Dialog from "@/components/ui/Dialog";

const steps = [
  {
    title: "Isi detail meeting",
    description:
      "Tuliskan agenda singkat dan pilih tanggal serta waktu acara yang diinginkan.",
  },
  {
    title: "Kirim pengajuan",
    description:
      "Tiket akan masuk ke antrean tim TI dengan status awal menunggu.",
  },
  {
    title: "Tunggu tautan Zoom",
    description: "Admin akan mengisi tautan Zoom setelah tiket diproses.",
  },
];

export default function ZoomGuideDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function openDialog() {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
      setIsOpen(true);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="zoom-guide-dialog"
        aria-label="Buka panduan pengajuan Zoom"
        onClick={openDialog}
        className="rounded-lg border border-info/20 bg-info-soft text-info transition-colors hover:bg-info/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
      >
        <InfoIcon size={16} />
      </button>

      <Dialog
        dialogRef={dialogRef}
        id="zoom-guide-dialog"
        titleId="zoom-guide-title"
        eyebrow="Request Zoom"
        title="Panduan pengajuan"
        tone="info"
        icon={
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-info-soft text-info ring-1 ring-info/10">
            <InfoIcon size={21} />
          </span>
        }
        closeLabel="Tutup panduan"
        onClose={() => setIsOpen(false)}
      >
        <p className="text-body leading-relaxed text-ink-soft">
          Ikuti langkah berikut agar tim TI dapat memproses kebutuhan meeting
          Anda dengan tepat.
        </p>

        <ol className="mt-5 space-y-1">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-3 rounded-xl px-2 py-2"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success-soft text-body-lg font-bold text-success">
                {index + 1}
              </span>
              <div className="min-w-0 pt-1">
                <h3 className="text-body-lg font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1 text-body-sm leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Dialog>
    </>
  );
}
