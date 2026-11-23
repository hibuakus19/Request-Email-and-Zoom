import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EmailAdminView from "@/components/email/EmailAdminView";
import EmailEmployeeView from "@/components/email/EmailEmployeeView";
import { getSessionWithFreshRole } from "@/lib/auth/admin";
import { destroySession, isAdmin } from "@/lib/auth/session";
import { loadKaryawanProfile } from "@/lib/karyawan/service";
import { loadEmailTickets, loadLatestEmailTicket } from "@/lib/tickets/service";
import { parseTicketListQuery } from "@/lib/validation/tickets";

export const metadata: Metadata = {
  title: "Request Email",
};

export default async function EmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSessionWithFreshRole();

  if (!session) {
    redirect("/?reason=session-expired");
  }

  const params = await searchParams;
  const isUserView = params.view === "user";

  if (isAdmin(session) && !isUserView) {
    const query = parseTicketListQuery(params);
    const result = await loadEmailTickets(query);

    return <EmailAdminView result={result} query={query} />;
  }
  const profile = await loadKaryawanProfile(session.nip);

  if (!profile.ok && profile.error.code === "NOT_FOUND") {
    await destroySession();
    redirect("/?reason=session-expired");
  }

  if (!profile.ok) {
    const latestEmail = await loadLatestEmailTicket(session.nip);

    return (
      <EmailEmployeeView
        user={{ ...session, emailPassword: null }}
        latestTicket={latestEmail}
      />
    );
  }

  const latestEmail = await loadLatestEmailTicket(profile.data.nip);

  return <EmailEmployeeView user={profile.data} latestTicket={latestEmail} />;
}
