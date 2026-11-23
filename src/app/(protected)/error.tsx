"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircleIcon, RefreshIcon } from "@/components/icons";

type ProtectedErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProtectedError({ error, reset }: ProtectedErrorProps) {
  useEffect(() => {
    console.error("Protected route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-8 sm:py-24">
      <span className="grid size-16 place-items-center rounded-2xl bg-danger-soft text-danger ring-1 ring-danger/10">
        <AlertCircleIcon size={30} />
      </span>
      <p className="mt-5 text-eyebrow font-bold uppercase tracking-[0.18em] text-danger">
        Terjadi kendala
      </p>
      <h1 className="mt-2 text-pretty text-display-md font-semibold tracking-[-0.035em] text-ink sm:text-display-lg">
        Halaman tidak dapat ditampilkan
      </h1>
      <p className="mt-3 max-w-md text-pretty text-body leading-relaxed text-ink-soft">
        Ada kendala teknis saat memuat halaman ini. Coba muat ulang, atau
        kembali ke Home jika masalah berlanjut.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-eyebrow text-muted">
          Kode kendala: {error.digest}
        </p>
      ) : null}

      <div className="mt-7 flex w-full flex-col justify-center gap-2.5 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-body-sm font-semibold text-white shadow-button-accent transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <RefreshIcon size={16} />
          Coba lagi
        </button>
        <Link
          href="/home"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line-strong bg-white px-5 text-body-sm font-semibold text-ink-soft transition hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Kembali ke Home
        </Link>
      </div>
    </div>
  );
}
