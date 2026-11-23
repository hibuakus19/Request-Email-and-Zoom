import "server-only";

import { cache } from "react";
import prisma from "@/lib/db/prisma";
import { getSession, type Session } from "./session";

/**
 * Returns the current session with the admin flag re-read from
 * `karyawan.is_admin` instead of trusting the snapshot stored in the session
 * cookie at login time. A revoked admin therefore loses access on their next
 * request instead of up to eight hours later (the session TTL).
 *
 * The NIP always comes from the verified session cookie, never from client
 * input. On a database failure the check fails closed (`isAdmin: false`) so an
 * outage can never silently grant admin privileges.
 */
export const getSessionWithFreshRole = cache(
  async (): Promise<Session | null> => {
    const session = await getSession();

    if (!session) {
      return null;
    }

    try {
      const karyawan = await prisma.karyawan.findUnique({
        where: { nip: session.nip },
        select: { isAdmin: true },
      });

      return { ...session, isAdmin: karyawan?.isAdmin === true };
    } catch (error) {
      console.error("Failed to verify admin role from database", error);

      return { ...session, isAdmin: false };
    }
  },
);
