import Link from "next/link";
import { ArrowLeftIcon, TicketIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-7 text-center shadow-card sm:p-9">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
          <TicketIcon size={24} />
        </span>
        <p className="mt-5 text-eyebrow font-bold uppercase tracking-[0.18em] text-accent">
          Halaman tidak ditemukan
        </p>
        <h1 className="mt-2 text-display-sm font-semibold tracking-[-0.03em] text-ink">
          Tautan ini tidak tersedia
        </h1>
        <p className="mt-2 text-body-sm leading-relaxed text-ink-soft">
          Halaman yang Anda cari mungkin sudah dipindahkan atau alamatnya tidak
          lengkap.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-body-sm font-semibold text-white transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeftIcon size={16} />
          Kembali ke Home
        </Link>
      </div>
    </main>
  );
}
