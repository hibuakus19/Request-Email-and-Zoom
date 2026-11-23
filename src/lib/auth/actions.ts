"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { validateLogin } from "@/lib/validation/login";
import type { FormActionState } from "@/lib/actions/types";
import { verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

const invalidCredentialsMessage =
  "NIP atau password tidak sesuai. Jika akun Anda belum memiliki password, hubungi administrator.";

export async function authLogin(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const nipValue = formData.get("nip");
  const passwordValue = formData.get("password");

  const validation = validateLogin({
    nip: typeof nipValue === "string" ? nipValue : "",
    password: typeof passwordValue === "string" ? passwordValue : "",
  });

  if (!validation.ok) {
    return {
      status: "error",
      message: "Periksa kembali NIP dan password Anda.",
      fieldErrors: validation.errors,
    };
  }

  let karyawan: {
    nip: string;
    nama: string;
    email: string | null;
    bagian: string | null;
    password: string | null;
    isAdmin: boolean | null;
  } | null;

  try {
    karyawan = await prisma.karyawan.findUnique({
      where: { nip: validation.value.nip },
      select: {
        nip: true,
        nama: true,
        email: true,
        bagian: true,
        password: true,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Login query failed", error);

    return {
      status: "error",
      message:
        "Login tidak dapat diproses saat ini. Silakan coba beberapa saat lagi.",
    };
  }

  if (
    !karyawan ||
    !(await verifyPassword(validation.value.password, karyawan.password))
  ) {
    return {
      status: "error",
      message: invalidCredentialsMessage,
    };
  }

  try {
    await createSession(
      {
        nip: karyawan.nip,
        nama: karyawan.nama,
        email: karyawan.email,
        bagian: karyawan.bagian,
      },
      // `is_admin` is the server-verified admin source. A NULL value is treated
      // as a regular employee (least privilege).
      karyawan.isAdmin === true,
    );
  } catch (error) {
    console.error("Unable to create session", error);

    return {
      status: "error",
      message:
        "Sesi login tidak dapat dibuat. Periksa konfigurasi server lalu coba lagi.",
    };
  }

  redirect("/home");
}

export async function authLogout() {
  await destroySession();
  redirect("/");
}
