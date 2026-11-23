"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { authLogin } from "@/lib/auth/actions";
import { initialFormState, type FormActionState } from "@/lib/actions/types";
import PasswordInput from "@/components/PasswordInput";
import SubmitButton from "@/components/SubmitButton";
import { Alert, FieldError } from "@/components/ui";
import { inputClassName, labelClassName } from "@/components/ui/form-styles";

type LoginFormProps = {
  notice?: string;
};

export default function LoginForm({ notice }: LoginFormProps) {
  const [state, formAction] = useActionState<FormActionState, FormData>(
    authLogin,
    initialFormState,
  );
  const [nip, setNip] = useState("");
  const nipRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "error") {
      return;
    }

    if (state.fieldErrors?.nip) {
      nipRef.current?.focus();
    } else if (state.fieldErrors?.password) {
      passwordRef.current?.focus();
    } else {
      errorSummaryRef.current?.focus();
    }
  }, [state]);

  const nipError = state.fieldErrors?.nip;
  const passwordError = state.fieldErrors?.password;

  return (
    <div>
      {notice ? (
        <Alert tone="warning" title="Sesi berakhir" className="mb-5">
          {notice}
        </Alert>
      ) : null}

      <form action={formAction} className="space-y-5">
        {state.status === "error" && state.message ? (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            className="rounded-xl outline-none"
          >
            <Alert tone="error" title="Login gagal">
              {state.message}
            </Alert>
          </div>
        ) : null}

        <div>
          <label htmlFor="login-nip" className={labelClassName}>
            Nomor Induk Pegawai (NIP)
          </label>
          <input
            ref={nipRef}
            id="login-nip"
            name="nip"
            type="text"
            required
            autoComplete="username"
            spellCheck={false}
            maxLength={255}
            value={nip}
            onChange={(event) => setNip(event.target.value)}
            aria-invalid={nipError ? true : undefined}
            aria-describedby={nipError ? "login-nip-error" : undefined}
            placeholder="Masukkan NIP"
            className={`${inputClassName} mt-2`}
          />
          <FieldError id="login-nip-error">{nipError}</FieldError>
        </div>

        <div>
          <label htmlFor="login-password" className={labelClassName}>
            Password
          </label>
          <div className="mt-2">
            <PasswordInput
              id="login-password"
              placeholder="Masukkan password"
              invalid={Boolean(passwordError)}
              describedBy={passwordError ? "login-password-error" : undefined}
              inputRef={passwordRef}
            />
          </div>
          <FieldError id="login-password-error">{passwordError}</FieldError>
        </div>

        <div className="pt-1">
          <SubmitButton pendingText="Memverifikasi..." showArrow>
            Masuk
          </SubmitButton>
        </div>
      </form>

      <p className="mt-6 border-t border-line pt-5 text-center text-small leading-relaxed text-muted">
        Belum punya akses atau lupa password?{" "}
        <span className="font-semibold text-ink-soft">
          Hubungi administrator TI.
        </span>
      </p>
    </div>
  );
}
