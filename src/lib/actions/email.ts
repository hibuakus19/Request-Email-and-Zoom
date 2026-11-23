"use server";

import { revalidatePath } from "next/cache";
import { getSessionWithFreshRole } from "@/lib/auth/admin";
import { isAdmin } from "@/lib/auth/session";
import { getTicketService } from "@/lib/tickets/service";
import { validateEmailStatusUpdate } from "@/lib/validation/email";
import type { FormActionState } from "./types";

const sessionExpiredMessage =
  "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function requestEmailTicketAction(): Promise<FormActionState> {
  const session = await getSessionWithFreshRole();

  if (!session) {
    return { status: "error", message: sessionExpiredMessage };
  }

  try {
    const result = await getTicketService().createEmailTicket({
      nip: session.nip,
    });

    if (!result.ok) {
      return { status: "error", message: result.error.message };
    }

    revalidatePath("/home/email");

    return {
      status: "success",
      message:
        "Pengajuan email berhasil dikirim dengan status Menunggu. Status terbaru terlihat di kartu profil.",
      reference: String(result.data.id),
    };
  } catch (error) {
    console.error("Email ticket action failed", error);

    return {
      status: "error",
      message:
        "Pengajuan belum dapat diproses. Silakan coba beberapa saat lagi.",
    };
  }
}

export async function updateEmailTicketStatusAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await getSessionWithFreshRole();

  if (!session) {
    return { status: "error", message: sessionExpiredMessage };
  }

  // Server-side authorization with the admin flag re-read from the database.
  // Hiding the editor in the UI is not enough.
  if (!isAdmin(session)) {
    return {
      status: "error",
      message: "Anda tidak memiliki akses untuk mengubah tiket email.",
    };
  }

  const validation = validateEmailStatusUpdate({
    id: readString(formData, "id"),
    status: readString(formData, "status"),
    email: readString(formData, "email"),
    emailPassword: readString(formData, "emailPassword"),
  });

  if (!validation.ok) {
    return {
      status: "error",
      message: "Periksa kembali status tiket.",
      fieldErrors: validation.errors,
    };
  }

  try {
    const result = await getTicketService().updateEmailTicketStatus(
      validation.value,
    );

    if (!result.ok) {
      return { status: "error", message: result.error.message };
    }

    revalidatePath("/home/email");

    return {
      status: "success",
      message: "Status tiket email berhasil diperbarui.",
      reference: String(result.data.id),
    };
  } catch (error) {
    console.error("Email ticket status update failed", error);

    return {
      status: "error",
      message:
        "Perubahan belum dapat disimpan. Silakan coba beberapa saat lagi.",
    };
  }
}
