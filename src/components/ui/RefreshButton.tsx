"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshIcon } from "@/components/icons";

type RefreshButtonProps = {
  label?: string;
  pendingLabel?: string;
};

export default function RefreshButton({
  label = "Muat ulang",
  pendingLabel = "Memuat...",
}: RefreshButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-3.5 text-label font-semibold text-ink-soft shadow-sm transition hover:border-line-strong hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshIcon size={15} className={pending ? "animate-spin" : ""} />
      <span>{pending ? pendingLabel : label}</span>
    </button>
  );
}
