import "server-only";

import {
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;

function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

function constantTimeEqual(left: string, right: string) {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();

  return timingSafeEqual(leftDigest, rightDigest);
}

/**
 * Hash format: scrypt$N$r$p$salt(base64url)$hash(base64url)
 *
 * This helper is not used by the frontend yet. It exists so the backend
 * migration can store hashes in the existing `karyawan.password` column
 * without a schema change.
 */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join("$");
}

export function isLegacyPlaintextPassword(stored: string) {
  return !stored.startsWith("scrypt$") && !stored.startsWith("$2");
}

/**
 * Verifies a scrypt hash produced by `hashPassword`.
 *
 * Legacy plaintext values are accepted only for backwards compatibility with
 * the existing database. They must be migrated to a password hash before
 * production go-live; see docs/frontend-backend-contract.md.
 */
export async function verifyPassword(password: string, stored: string | null) {
  if (!stored) {
    return false;
  }

  if (stored.startsWith("$2")) {
    // bcrypt is not available in the current dependency set.
    return false;
  }

  if (!stored.startsWith("scrypt$")) {
    return constantTimeEqual(password, stored);
  }

  const parts = stored.split("$");

  if (parts.length !== 6) {
    return false;
  }

  const [, nValue, rValue, pValue, saltValue, hashValue] = parts;
  const N = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);

  if (
    !Number.isInteger(N) ||
    !Number.isInteger(r) ||
    !Number.isInteger(p) ||
    N <= 1 ||
    r <= 0 ||
    p <= 0
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expected = Buffer.from(hashValue, "base64url");
    const actual = await scryptAsync(password, salt, expected.length, {
      N,
      r,
      p,
      maxmem: 128 * N * r * 2,
    });

    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}
