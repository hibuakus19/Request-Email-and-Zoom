import {
  CalendarIcon,
  MailIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/tickets/format";
import EmailCredentialDisplay from "@/components/email/EmailCredentialDisplay";

type UserInformationProps = {
  user: {
    nama: string;
    nip: string;
    email: string | null;
    emailPassword?: string | null;
    bagian: string | null;
  };
  latestRequest?: {
    /**
     * Latest email ticket of the employee (by `created_at`). Null when the
     * employee has never submitted a request.
     */
    ticket: {
      request: string;
      status: string;
      createdAt: string;
    } | null;
    unavailable: boolean;
  };
  className?: string;
};

export default function UserInformation({
  user,
  latestRequest,
  className = "",
}: UserInformationProps) {
  // A rejected request must not change existing credentials. Keep displaying
  // the current email password when the employee already has an email; a new
  // password entered for a rejected creation/reset request is never persisted.
  const emailPassword = user.email ? user.emailPassword : null;

  return (
    <section
      aria-labelledby="user-information-title"
      className={`overflow-hidden rounded-card border border-line bg-surface shadow-card ${className}`}
    >
      <div className="border-b border-line bg-gradient-to-br from-white via-white to-accent-soft/70 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink ring-1 ring-accent/10"
          >
            <UserIcon size={26} />
          </span>
          <div className="min-w-0">
            <p className="text-eyebrow font-bold uppercase tracking-[0.18em] text-accent">
              Profil karyawan
            </p>
            <h2
              id="user-information-title"
              className="mt-1 truncate text-title font-semibold tracking-[-0.02em] text-ink"
            >
              {user.nama}
            </h2>
            <p className="mt-0.5 font-mono text-caption text-muted">
              NIP {user.nip}
            </p>
          </div>
        </div>
      </div>

      <dl className="grid gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2 sm:px-6 sm:py-6">
        <div className="min-w-0">
          <dt className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-muted">
            Nama
          </dt>
          <dd className="mt-1 break-words text-body-lg font-medium text-ink">
            {user.nama}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-muted">
            NIP
          </dt>
          <dd className="mt-1 break-all font-mono text-body font-medium text-ink">
            {user.nip}
          </dd>
        </div>

        <div className={`min-w-0 ${emailPassword ? "" : "sm:col-span-2"}`}>
          <dt className="flex items-center gap-1.5 text-eyebrow font-semibold uppercase tracking-[0.14em] text-muted">
            <MailIcon size={13} />
            Email
          </dt>
          <dd className="mt-1.5">
            {user.email ? (
              <span className="break-all text-body-lg font-medium text-ink">
                {user.email}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning-soft px-2.5 py-1 text-caption font-semibold text-warning">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-current"
                />
                Belum memiliki email
              </span>
            )}
          </dd>
        </div>

        {emailPassword ? (
          <EmailCredentialDisplay password={emailPassword} />
        ) : null}

        {latestRequest ? (
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-muted">
              Pengajuan Email Terakhir
            </dt>
            <dd className="mt-2">
              {latestRequest.unavailable ? (
                <p className="text-label leading-relaxed text-muted">
                  Status pengajuan gagal dimuat. Muat ulang halaman untuk
                  mencoba lagi, atau hubungi administrator jika masalah
                  berlanjut.
                </p>
              ) : latestRequest.ticket ? (
                <div className="space-y-2.5 rounded-xl border border-line bg-paper/60 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      value={latestRequest.ticket.request}
                      kind="request"
                    />
                    <StatusBadge value={latestRequest.ticket.status} />
                  </div>
                  <p className="flex items-center gap-1.5 text-caption text-ink-soft">
                    <CalendarIcon size={13} className="shrink-0 text-muted" />
                    Tanggal pengajuan:{" "}
                    <span className="font-semibold">
                      {formatDateTime(latestRequest.ticket.createdAt)}
                    </span>
                  </p>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-deep px-2.5 py-1 text-caption font-semibold text-ink-soft">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-current"
                  />
                  Belum ada pengajuan
                </span>
              )}
            </dd>
          </div>
        ) : null}

        <div className="min-w-0 sm:col-span-2">
          <dt className="flex items-center gap-1.5 text-eyebrow font-semibold uppercase tracking-[0.14em] text-muted">
            <UsersIcon size={13} />
            Divisi / Bagian
          </dt>
          <dd className="mt-1 break-words text-body-lg font-medium text-ink">
            {user.bagian ? (
              user.bagian
            ) : (
              <span className="font-normal text-muted">Belum diisi</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
