import type { ReactNode, RefObject } from "react";
import { CloseIcon } from "@/components/icons";
import { buttonClassName } from "./Button";

type DialogTone = "accent" | "success" | "info";

type DialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  id?: string;
  titleId: string;
  eyebrow: string;
  title: string;
  icon?: ReactNode;
  tone?: DialogTone;
  closeLabel?: string;
  onClose?: () => void;
  children: ReactNode;
};

const toneStyles: Record<DialogTone, string> = {
  accent: "text-accent",
  success: "text-success",
  info: "text-info",
};

export default function Dialog({
  dialogRef,
  id,
  titleId,
  eyebrow,
  title,
  icon,
  tone = "accent",
  closeLabel = "Tutup dialog",
  onClose,
  children,
}: DialogProps) {
  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          dialogRef.current?.close();
        }
      }}
      className="m-auto max-h-[88dvh] w-[min(94vw,560px)] overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-left text-ink shadow-lift backdrop:bg-ink/45 backdrop:backdrop-blur-[2px]"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur">
        <div className="flex min-w-0 items-start gap-3">
          {icon}
          <div className="min-w-0">
            <p
              className={`text-micro font-bold uppercase tracking-[0.16em] ${toneStyles[tone]}`}
            >
              {eyebrow}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-title-sm font-semibold tracking-[-0.02em] text-ink"
            >
              {title}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label={closeLabel}
          className={buttonClassName({ variant: "ghost", size: "icon" })}
        >
          <CloseIcon size={18} />
        </button>
      </div>

      <div className="px-5 py-5">{children}</div>
    </dialog>
  );
}
