import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  neutral: "bg-slate-100 text-slate-700",
  income: "bg-mint text-mint-strong",
  expense: "bg-danger-soft text-danger",
  primary: "bg-primary-soft text-primary",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold", variants[variant], className)}
      {...props}
    />
  );
}

