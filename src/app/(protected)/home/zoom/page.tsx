import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ZoomAdminView from "@/components/zoom/ZoomAdminView";
import ZoomEmployeeView from "@/components/zoom/ZoomEmployeeView";
import { getSessionWithFreshRole } from "@/lib/auth/admin";
import { isAdmin } from "@/lib/auth/session";
import {
  loadZoomTicketsForEmployee,
  loadZoomTickets,
} from "@/lib/tickets/service";
import { getCurrentDateTimeLocal } from "@/lib/validation/zoom";
import { parseTicketListQuery } from "@/lib/validation/tickets";

export const metadata: Metadata = {
  title: "Request Zoom",
};

export default async function ZoomPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Admin role is re-read from the database so a revoked admin cannot keep
  // the admin view for the remainder of the session TTL.
  const session = await getSessionWithFreshRole();

  if (!session) {
    redirect("/?reason=session-expired");
  }

  const params = await searchParams;
  const isUserView = params.view === "user";

  if (isAdmin(session) && !isUserView) {
    const query = parseTicketListQuery(params);
    const result = await loadZoomTickets(query);

    return <ZoomAdminView result={result} query={query} />;
  }

  return (
    <ZoomEmployeeView
      minDateTime={getCurrentDateTimeLocal()}
      tickets={await loadZoomTicketsForEmployee(session.nip)}
    />
  );
}
