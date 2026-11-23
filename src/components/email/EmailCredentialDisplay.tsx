"use client";

import { useState } from "react";

type EmailCredentialDisplayProps = {
  password: string;
};

export default function EmailCredentialDisplay({
  password,
}: EmailCredentialDisplayProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div className="min-w-0">
      <dt className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-muted">
        Password default
      </dt>
      <dd className="mt-1">
        <div className="flex min-h-10 items-center justify-between gap-3">
          <span
            aria-live="polite"
            className="min-w-0 break-all font-mono text-body-sm font-medium text-ink"
          >
            {isPasswordVisible ? password : "••••••••"}
          </span>
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-pressed={isPasswordVisible}
            aria-label={
              isPasswordVisible ? "Sembunyikan password" : "Tampilkan password"
            }
            className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white px-3 text-caption font-semibold text-ink-soft transition hover:border-accent/30 hover:bg-accent-soft hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {isPasswordVisible ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
        <p className="mt-1 text-caption leading-relaxed text-ink-soft">
          Password default dari admin bisa berbeda jika Anda pernah menggantinya
          sendiri.
        </p>
      </dd>
    </div>
  );
}
