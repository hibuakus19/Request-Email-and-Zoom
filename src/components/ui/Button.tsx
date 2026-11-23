import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "icon";

type ButtonClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  secondary:
    "border border-line-strong bg-white text-ink-soft shadow-sm hover:border-accent/30 hover:bg-accent-soft hover:text-accent-ink",
  ghost: "text-muted hover:bg-paper-deep hover:text-ink",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 gap-1.5 rounded-lg px-3 text-caption font-semibold",
  md: "min-h-11 gap-2 rounded-xl px-4 text-label font-semibold",
  icon: "size-10 rounded-full",
};

export function buttonClassName({
  variant = "secondary",
  size = "md",
}: ButtonClassOptions = {}) {
  return `inline-flex items-center justify-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${sizeStyles[size]} ${variantStyles[variant]}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonClassOptions;

export default function Button({
  variant,
  size,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClassName({ variant, size })} ${className}`}
      {...props}
    />
  );
}
