"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { getSessionWithFreshRole } from "@/lib/auth/admin";
import { isAdmin } from "@/lib/auth/session";
import { getTicketService } from "@/lib/tickets/service";
import { validateZoomRequest, validateZoomUpdate } from "@/lib/validation/zoom";
import type { FormActionState } from "./types";

const sessionExpiredMessage =
  "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getZoomCreateFailure(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const column =
      typeof error.meta?.column === "string" ? error.meta.column : undefined;

    if (error.code === "P2022") {
      return {
        code: error.code,
        message: `Kolom ${column ?? "link_surat"} belum tersedia pada database yang digunakan. Pastikan schema database sudah diperbarui.`,
      };
    }

    if (error.code === "P2000" && column?.includes("link_surat")) {
      return {
        code: error.code,
        message:
          "Link surat perintah terlalu panjang. Gunakan link maksimal 255 karakter.",
      };
    }

    if (error.code === "P2000") {
      return {
        code: error.code,
        message:
          "Salah satu data pengajuan melebihi batas kolom database. Periksa kembali data dan link surat perintah.",
      };
    }

    if (error.code === "P2003") {
      return {
        code: error.code,
        message:
          "Akun pemohon tidak cocok dengan data karyawan di database. Silakan login ulang atau hubungi administrator.",
      };
    }

    return {
      code: error.code,
      message: `Pengajuan Zoom gagal disimpan (kode ${error.code}). Silakan hubungi administrator.`,
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    const code = error.errorCode ?? "DATABASE_CONNECTION";

    return {
      code,
      message:
        "Database tidak dapat diakses. Periksa koneksi database dan coba kembali.",
    };
  }

  return {
    code: "UNKNOWN",
    message:
      "Pengajuan belum dapat diproses. Detail error sudah dicatat di log server; silakan hubungi administrator.",
  };
}

export async function createZoomTicketAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await getSessionWithFreshRole();

  if (!session) {
    return { status: "error", message: sessionExpiredMessage };
  }

  const validation = validateZoomRequest({
    description: readString(formData, "description"),
    date: readString(formData, "date"),
    linkSurat: readString(formData, "linkSurat"),
  });

  if (!validation.ok) {
    return {
      status: "error",
      message: "Periksa kembali data pengajuan Zoom Anda.",
      fieldErrors: validation.errors,
    };
  }

  try {
    const result = await getTicketService().createZoomTicket({
      nip: session.nip,
      description: validation.value.description,
      date: validation.value.date,
      linkSurat: validation.value.linkSurat,
    });

    if (!result.ok) {
      return { status: "error", message: result.error.message };
    }

    revalidatePath("/home/zoom");

    return {
      status: "success",
      message:
        "Pengajuan Zoom berhasil dikirim dengan status Menunggu. Status terbaru terlihat di bagian informasi tiket.",
      reference: String(result.data.id),
    };
  } catch (error) {
    const failure = getZoomCreateFailure(error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("Zoom ticket action failed", {
      code: failure.code,
      message: errorMessage,
    });

    return {
      status: "error",
      message: failure.message,
    };
  }
}

export async function updateZoomTicketAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await getSessionWithFreshRole();

  if (!session) {
    return { status: "error", message: sessionExpiredMessage };
  }

  if (!isAdmin(session)) {
    return {
      status: "error",
      message: "Anda tidak memiliki akses untuk mengubah tiket Zoom.",
    };
  }

  const validation = validateZoomUpdate({
    id: readString(formData, "id"),
    zoomLink: readString(formData, "zoomLink"),
    status: readString(formData, "status"),
    alasanDitolak: readString(formData, "alasanDitolak"),
  });

  if (!validation.ok) {
    return {
      status: "error",
      message: "Periksa kembali tautan, status, dan alasan penolakan tiket.",
      fieldErrors: validation.errors,
    };
  }

  try {
    const result = await getTicketService().updateZoomTicket(validation.value);

    if (!result.ok) {
      return { status: "error", message: result.error.message };
    }

    revalidatePath("/home/zoom");

    return {
      status: "success",
      message: "Tiket Zoom berhasil diperbarui.",
      reference: String(result.data.id),
    };
  } catch (error) {
    console.error("Zoom ticket update failed", error);

    return {
      status: "error",
      message:
        "Perubahan belum dapat disimpan. Silakan coba beberapa saat lagi.",
    };
  }
}
