import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-white hover:bg-[#0b2f4e]",
  secondary: "border border-border-soft bg-white text-primary hover:bg-primary-soft",
  subtle: "bg-primary-soft text-primary hover:bg-[#d7eaf8]",
  danger: "bg-danger text-white hover:bg-[#b93a3a]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function buttonStyles(variant: keyof typeof variants = "primary", className?: string) {
  return cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className,
  );
}

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles(variant, className)} {...props} />;
}

