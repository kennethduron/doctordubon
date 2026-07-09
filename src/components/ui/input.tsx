import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <input
        id={id}
        className={cn(
          "h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary-soft",
          className,
        )}
        {...props}
      />
    </label>
  );
}

