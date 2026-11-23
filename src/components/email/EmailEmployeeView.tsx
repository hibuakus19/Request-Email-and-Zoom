import { KeyIcon, MailIcon, ShieldIcon } from "@/components/icons";
import { PageHeader } from "@/components/ui";
import UserInformation from "@/components/user/UserInformation";
import EmailRequestButton from "./EmailRequestButton";
import type { EmailTicketView, ServiceResult } from "@/lib/tickets/types";

type EmailEmployeeViewProps = {
  /**
   * Latest profile read from the database for the authenticated NIP. Not the
   * session snapshot, so an email changed after login is reflected here.
   */
  user: {
    nama: string;
    nip: string;
    email: string | null;
    emailPassword: string | null;
    bagian: string | null;
  };
  latestTicket: ServiceResult<EmailTicketView | null>;
};

export default function EmailEmployeeView({
  user,
  latestTicket,
}: EmailEmployeeViewProps) {
  const hasEmail = user.email !== null;
  const Icon = hasEmail ? KeyIcon : MailIcon;
  const ticket = latestTicket.ok ? latestTicket.data : null;
  const hasPendingTicket = ticket?.status === "PENDING";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-5 sm:px-8 sm:pt-5 sm:pb-10 lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:overflow-hidden lg:px-10 lg:pt-6 lg:pb-4">
      <PageHeader
        eyebrow="Layanan email"
        title="Request Email"
        description="Periksa informasi akun Anda, lalu ajukan layanan email yang sesuai. Tidak ada formulir tambahan yang perlu diisi."
        className="animate-rise-in lg:shrink-0"
      />

      <div className="mt-7 grid gap-5 lg:mt-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch">
        <UserInformation
          user={user}
          latestRequest={{
            ticket,
            unavailable: !latestTicket.ok,
          }}
          className="animate-rise-in lg:min-h-0 lg:overflow-y-auto"
        />

        <section
          aria-labelledby="email-request-title"
          className="animate-rise-in overflow-hidden rounded-card border border-line bg-surface shadow-card lg:min-h-0 lg:self-start"
        >
          <div className="h-1 bg-gradient-to-r from-accent to-accent-light" />
          <div className="p-5 sm:p-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-ink ring-1 ring-accent/10">
              <Icon size={23} />
            </span>
            <h2
              id="email-request-title"
              className="mt-2 text-title-lg font-semibold tracking-[-0.02em] text-ink"
            >
              {hasEmail ? "Reset password email" : "Pembuatan email baru"}
            </h2>
            <p className="mt-2 text-body-sm leading-relaxed text-ink-soft">
              {hasEmail
                ? "Email kantor Anda sudah terdaftar. Gunakan pengajuan ini jika Anda tidak dapat mengakses akun email dan memerlukan reset password."
                : "Anda belum memiliki email kantor. Ajukan pembuatan email agar tim TI dapat menyiapkan akun Anda."}
            </p>

            <div className="mt-3 rounded-xl border border-line bg-paper/70 p-3">
              <p className="flex items-start gap-2 text-caption leading-relaxed text-ink-soft">
                <ShieldIcon size={15} className="mt-0.5 shrink-0 text-accent" />
                Jenis pengajuan ditentukan otomatis berdasarkan status email
                akun Anda di server.
              </p>
            </div>

            <div className="mt-5">
              <EmailRequestButton
                hasEmail={hasEmail}
                hasPendingTicket={hasPendingTicket}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
