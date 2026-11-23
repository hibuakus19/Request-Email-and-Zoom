"use client";

import { useId, useRef } from "react";
import { CheckCircleIcon } from "@/components/icons";

const LOCKED_HINT = "Request yang sudah selesai ditangani tidak dapat diubah";

export default function LockedLabel() {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  function hide() {
    const tooltip = tooltipRef.current;

    if (tooltip?.matches(":popover-open")) {
      tooltip.hidePopover();
    }
  }

  function show() {
    const button = buttonRef.current;
    const tooltip = tooltipRef.current;

    if (!button || !tooltip || tooltip.matches(":popover-open")) {
      return;
    }

    const rect = button.getBoundingClientRect();
    tooltip.style.top = `${rect.top + rect.height / 2}px`;
    tooltip.style.left = `${rect.right + 8}px`;
    tooltip.showPopover();

    window.addEventListener("scroll", hide, { capture: true, once: true });
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-describedby={tooltipId}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={show}
        className="inline-flex min-h-10 items-center rounded-lg border border-success/25 bg-success-soft px-3 text-caption font-semibold text-success outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <CheckCircleIcon size={14} />
        Sudah Ditangani
      </button>
      <span
        ref={tooltipRef}
        id={tooltipId}
        popover="auto"
        role="tooltip"
        className="m-0 inset-auto w-max max-w-[240px] -translate-y-1/2 rounded-lg border-0 bg-ink px-3 py-2 text-caption leading-relaxed text-white shadow-lift"
      >
        {LOCKED_HINT}
      </span>
    </>
  );
}
