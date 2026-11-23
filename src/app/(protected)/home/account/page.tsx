import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getSessionWithFreshRole } from "@/lib/auth/admin";
import { destroySession, isAdmin } from "@/lib/auth/session";
import { loadKaryawanProfile } from "@/lib/karyawan/service";

export const metadata: Metadata = {
  title: "Informasi Akun",
};

export default async function AccountPage() {
  // Admin role is re-read from the database, not taken from the session
  // snapshot, so a revoked admin sees "Karyawan" immediately.
  const session = await getSessionWithFreshRole();

  if (!session) {
    redirect("/?reason=session-expired");
  }

  const profile = await loadKaryawanProfile(session.nip);

  if (!profile.ok && profile.error.code === "NOT_FOUND") {
    await destroySession();
    redirect("/?reason=session-expired");
  }

  const nama = profile.ok ? profile.data.nama : session.nama;
  const email = profile.ok ? profile.data.email : session.email;
  const bagian = profile.ok ? profile.data.bagian : session.bagian;
  const isAdministrator = profile.ok ? profile.data.isAdmin : isAdmin(session);

  const rows = [
    { label: "Email", value: email ?? "Belum memiliki email" },
    { label: "Divisi / Bagian", value: bagian ?? "Belum diisi" },
    {
      label: "Peran",
      value: isAdministrator ? "Administrator" : "Karyawan",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Profil"
        title="Informasi Akun"
        description="Informasi akun yang sedang digunakan untuk mengakses layanan."
        className="animate-rise-in"
      />

      <section
        aria-labelledby="account-profile-title"
        className="animate-rise-in mt-7 overflow-hidden rounded-card border border-line bg-surface shadow-card"
      >
        <div className="flex items-center gap-4 border-b border-line bg-gradient-to-br from-white via-white to-accent-soft/70 px-5 py-5 sm:px-6">
          <Image
            src="/avatar.svg"
            alt=""
            width={72}
            height={72}
            className="size-16 shrink-0 rounded-full border border-accent/10 bg-white sm:size-[72px]"
          />
          <div className="min-w-0">
            <p className="text-eyebrow font-bold uppercase tracking-[0.16em] text-accent">
              Detail akun
            </p>
            <h2
              id="account-profile-title"
              className="mt-1 break-words text-title font-semibold tracking-[-0.02em] text-ink sm:text-title-xl"
            >
              {nama}
            </h2>
            <p className="mt-0.5 font-mono text-caption text-muted">
              NIP {session.nip}
            </p>
          </div>
        </div>

        <dl className="divide-y divide-line">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:items-center sm:gap-4 sm:px-6"
            >
              <dt className="text-small font-medium text-muted sm:text-label">
                {row.label}
              </dt>
              <dd className="min-w-0 text-left text-body-sm font-medium break-words text-ink sm:text-body">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
