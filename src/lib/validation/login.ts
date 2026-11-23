export type LoginFieldErrors = {
  nip?: string;
  password?: string;
};

export type LoginValidationResult =
  | {
      ok: true;
      value: {
        nip: string;
        password: string;
      };
    }
  | {
      ok: false;
      errors: LoginFieldErrors;
    };

export function validateLogin(input: {
  nip: string;
  password: string;
}): LoginValidationResult {
  const errors: LoginFieldErrors = {};
  const nip = input.nip.trim();
  const password = input.password;

  if (!nip) {
    errors.nip = "NIP wajib diisi.";
  } else if (nip.length > 255) {
    errors.nip = "NIP terlalu panjang.";
  }

  if (!password) {
    errors.password = "Password wajib diisi.";
  } else if (password.length > 255) {
    errors.password = "Password terlalu panjang.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { nip, password } };
}
