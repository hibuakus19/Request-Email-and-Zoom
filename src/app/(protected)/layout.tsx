import { redirect } from "next/navigation";
import ProtectedNavigation from "@/components/shared/ProtectedNavigation";
import { getSessionWithFreshRole } from "@/lib/auth/admin";
import { isAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithFreshRole();

  if (!session) {
    redirect("/?reason=session-expired");
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lift focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Lewati ke konten utama
      </a>

      <ProtectedNavigation isAdmin={isAdmin(session)} userName={session.nama} />

      <main id="main-content" className="flex min-h-0 min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
