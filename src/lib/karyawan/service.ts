import "server-only";

import prisma from "@/lib/db/prisma";
import type { ServiceResult } from "@/lib/tickets/types";

export type KaryawanProfile = {
  nip: string;
  nama: string;
  email: string | null;
  emailPassword: string | null;
  bagian: string | null;
  /**
   * Fresh `karyawan.is_admin` value read from the database, not the session
   * snapshot taken at login time.
   */
  isAdmin: boolean;
};

/**
 * Loads the latest employee profile for the authenticated NIP. The NIP always
 * comes from the verified session — never from client input. Name, email,
 * division, and the admin flag reflect the current database state so a stale
 * session snapshot cannot be displayed or used for authorization.
 */
export async function loadKaryawanProfile(
  nip: string,
): Promise<ServiceResult<KaryawanProfile>> {
  try {
    const karyawan = await prisma.karyawan.findUnique({
      where: { nip },
      select: {
        nip: true,
        nama: true,
        email: true,
        emailPassword: true,
        bagian: true,
        isAdmin: true,
      },
    });

    if (!karyawan) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message:
            "Data akun tidak ditemukan. Silakan login ulang atau hubungi administrator.",
        },
      };
    }

    return {
      ok: true,
      data: {
        nip: karyawan.nip,
        nama: karyawan.nama,
        email: karyawan.email,
        emailPassword: karyawan.emailPassword,
        bagian: karyawan.bagian,
        isAdmin: karyawan.isAdmin === true,
      },
    };
  } catch (error) {
    console.error("Failed to load karyawan profile", error);

    return {
      ok: false,
      error: {
        code: "UNKNOWN",
        message:
          "Profil gagal dimuat. Silakan muat ulang halaman atau hubungi administrator.",
      },
    };
  }
}
