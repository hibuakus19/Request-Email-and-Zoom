"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRightIcon, SpinnerIcon } from "@/components/icons";

type SubmitButtonProps = {
  children?: ReactNode;
  pendingText?: string;
  icon?: ReactNode;
  showArrow?: boolean;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
};

export default function SubmitButton({
  children = "Masuk",
  pendingText = "Memproses...",
  icon,
  showArrow = false,
  fullWidth = true,
  className = "",
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-body-sm font-semibold tracking-[0.01em] text-white shadow-button-accent transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:bg-accent-hover active:translate-y-px disabled:cursor-not-allowed disabled:border-transparent disabled:bg-paper-deep disabled:text-muted disabled:shadow-none ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {pending ? (
        <SpinnerIcon size={17} />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span className="truncate">{pending ? pendingText : children}</span>
      {!pending && showArrow ? (
        <ArrowRightIcon
          size={16}
          className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      ) : null}
    </button>
  );
}
