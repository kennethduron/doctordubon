import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <textarea
        id={id}
        className={cn(
          "min-h-24 w-full resize-y rounded-md border border-border-soft bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary-soft",
          className,
        )}
        {...props}
      />
    </label>
  );
}

