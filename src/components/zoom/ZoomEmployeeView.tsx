import { ClockIcon, TicketIcon, VideoIcon } from "@/components/icons";
import { Alert, PageHeader } from "@/components/ui";
import RefreshButton from "@/components/ui/RefreshButton";
import type { ServiceResult, ZoomTicketView } from "@/lib/tickets/types";
import ZoomGuideDialog from "./ZoomGuideDialog";
import ZoomRequestForm from "./ZoomRequestForm";
import ZoomTicketCard from "./ZoomTicketCard";

type ZoomEmployeeViewProps = {
  minDateTime: string;
  tickets: ServiceResult<ZoomTicketView[]>;
};

export default function ZoomEmployeeView({
  minDateTime,
  tickets: ticketsResult,
}: ZoomEmployeeViewProps) {
  const tickets = ticketsResult.ok ? ticketsResult.data : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-8 sm:px-8 sm:pt-5 sm:pb-10 lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:overflow-hidden lg:px-10 lg:pt-6 lg:pb-4">
      <PageHeader
        eyebrow="Layanan Zoom"
        title="Request Zoom"
        description="Ajukan ruang Zoom untuk kebutuhan meeting Anda. Setiap tiket dapat memiliki deskripsi serta tanggal dan waktu acara sendiri."
        className="animate-rise-in lg:shrink-0"
      />

      <div className="mt-7 grid gap-5 lg:mt-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch">
        <section
          aria-labelledby="zoom-form-title"
          className="animate-rise-in flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card lg:min-h-0"
        >
          <div className="h-1 bg-gradient-to-r from-success to-success-light" />
          <div className="p-5 sm:p-6 lg:min-h-0 lg:flex-1 lg:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-success-soft text-success ring-1 ring-success/10">
                  <VideoIcon size={22} />
                </span>
                <div className="min-w-0">
                  <h2
                    id="zoom-form-title"
                    className="text-title-lg font-semibold tracking-[-0.02em] text-ink"
                  >
                    Form pengajuan Zoom
                  </h2>
                  <p className="mt-1 text-label leading-relaxed text-ink-soft lg:text-caption">
                    Lengkapi dua kolom berikut. Tidak perlu mengisi email atau
                    password.
                  </p>
                </div>
              </div>
              <ZoomGuideDialog />
            </div>

            <div className="mt-6 lg:mt-4">
              <ZoomRequestForm minDateTime={minDateTime} />
            </div>
          </div>
        </section>

        <aside className="animate-rise-in space-y-4 lg:flex lg:min-h-0 lg:flex-col">
          <section
            aria-labelledby="zoom-status-title"
            className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TicketIcon size={17} className="text-success" />
                <h2
                  id="zoom-status-title"
                  className="text-body font-semibold text-ink"
                >
                  Riwayat permintaan Zoom
                </h2>
              </div>
              <RefreshButton label="Refresh" pendingLabel="Memuat..." />
            </div>

            <div className="mt-4 lg:flex lg:min-h-0 lg:flex-1">
              {!ticketsResult.ok ? (
                <Alert tone="error" title="Gagal memuat riwayat">
                  {ticketsResult.error.message}
                </Alert>
              ) : tickets.length > 0 ? (
                <ul className="max-h-[520px] space-y-3 overflow-y-auto pr-1 lg:h-full lg:max-h-none lg:min-h-0 lg:flex-1">
                  {tickets.map((ticket) => (
                    <li key={ticket.id}>
                      <ZoomTicketCard ticket={ticket} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-line bg-paper/70 p-3">
                  <p className="text-caption leading-relaxed text-ink-soft">
                    Belum ada permintaan Zoom. Semua tiket yang Anda ajukan akan
                    muncul di sini.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-card border border-line bg-paper/80 p-5">
            <div className="flex items-start gap-2.5">
              <ClockIcon size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-caption leading-relaxed text-ink-soft">
                Anda dapat mengajukan beberapa permintaan Zoom. Setiap
                permintaan diproses secara terpisah oleh tim TI.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
