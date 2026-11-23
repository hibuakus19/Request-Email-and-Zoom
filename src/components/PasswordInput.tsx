"use client";

import { useState, type ChangeEvent, type Ref } from "react";
import { inputClassName } from "@/components/ui/form-styles";

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[18px]"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[18px]"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c6 0 9.5 6 9.5 6a17.7 17.7 0 0 1-3.3 3.9" />
      <path d="M6.3 7.8A17 17 0 0 0 2.5 12S6 18 12 18a9.6 9.6 0 0 0 4.1-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

type PasswordInputProps = {
  id?: string;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  inputRef?: Ref<HTMLInputElement>;
  /** Removes every whitespace character while typing or pasting. */
  noSpaces?: boolean;
};

export default function PasswordInput({
  id = "password",
  name = "password",
  placeholder = "Masukkan password",
  autoComplete = "current-password",
  required = true,
  invalid = false,
  describedBy,
  inputRef,
  noSpaces = false,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!noSpaces) {
      return;
    }

    const input = event.currentTarget;
    const cleaned = input.value.replace(/\s/g, "");

    if (cleaned !== input.value) {
      const { selectionStart, selectionEnd } = input;
      input.value = cleaned;
      input.setSelectionRange(selectionStart, selectionEnd);
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={handleChange}
        className={`${inputClassName} pr-12`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-controls={id}
        aria-pressed={isVisible}
        aria-label={isVisible ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
