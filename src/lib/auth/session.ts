import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";

const SESSION_COOKIE = "ticketing_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const DEVELOPMENT_SECRET =
  "development-only-session-secret-change-before-production";

export type SessionUser = {
  nip: string;
  nama: string;
  email: string | null;
  bagian: string | null;
};

export type Session = SessionUser & {
  /**
   * Server-verified admin flag from `karyawan.is_admin`. `null` in the database
   * is treated as `false` (least privilege).
   */
  isAdmin: boolean;
  issuedAt: number;
  expiresAt: number;
};

type SessionPayload = Session & { version: 2 };

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET ?? process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEVELOPMENT_SECRET;
  }

  throw new Error(
    "SESSION_SECRET is not configured. Set it before running in production.",
  );
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const value = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${value}.${sign(value)}`;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function decodeSession(token: string): SessionPayload | null {
  const separatorIndex = token.lastIndexOf(".");

  if (separatorIndex <= 0) {
    return null;
  }

  const value = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = sign(value);
  const signatureBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expectedSignature, "base64url");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate = parsed as Partial<SessionPayload>;

    if (
      candidate.version !== 2 ||
      typeof candidate.nip !== "string" ||
      !candidate.nip ||
      typeof candidate.nama !== "string" ||
      !candidate.nama ||
      !isNullableString(candidate.email) ||
      !isNullableString(candidate.bagian) ||
      typeof candidate.isAdmin !== "boolean" ||
      typeof candidate.issuedAt !== "number" ||
      typeof candidate.expiresAt !== "number"
    ) {
      return null;
    }

    if (candidate.expiresAt <= Date.now()) {
      return null;
    }

    return candidate as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(
  user: SessionUser,
  isAdmin: boolean = false,
) {
  const issuedAt = Date.now();
  const payload: SessionPayload = {
    version: 2,
    ...user,
    isAdmin,
    issuedAt,
    expiresAt: issuedAt + SESSION_TTL_SECONDS * 1000,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export const getSession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = decodeSession(token);

    if (!payload) {
      return null;
    }

    return {
      nip: payload.nip,
      nama: payload.nama,
      email: payload.email,
      bagian: payload.bagian,
      isAdmin: payload.isAdmin,
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
    };
  } catch (error) {
    console.error("Unable to verify session", error);
    return null;
  }
});

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function isAdmin(session: Session | null): boolean {
  return session?.isAdmin === true;
}
