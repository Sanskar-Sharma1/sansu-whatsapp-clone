import type { InputHTMLAttributes } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export function AuthField({ id, label, className = "", ...rest }: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border border-line bg-input px-4 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand ${className}`}
        {...rest}
      />
    </div>
  );
}
