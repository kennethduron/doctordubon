import type { ChangeEvent, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectOption = string | { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: SelectOption[];
};

function getOptionValue(option: SelectOption) {
  return typeof option === "string" ? option : option.value;
}

function getOptionLabel(option: SelectOption) {
  return typeof option === "string" ? option : option.label;
}

export function Select({ label, options, className, id, onChange, ...props }: SelectProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange?.(event);
  }

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <select
        id={id}
        className={cn(
          "h-11 w-full rounded-md border border-border-soft bg-white px-3 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary-soft",
          className,
        )}
        onChange={handleChange}
        {...props}
      >
        {options.map((option) => (
          <option key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
