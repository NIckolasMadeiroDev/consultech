"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly hint?: string;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly rightAction?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      rightAction,
      id: idProp,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const hasError = Boolean(error);
    let ariaDescribedBy: string | undefined;
    if (error) ariaDescribedBy = `${id}-error`;
    else if (hint) ariaDescribedBy = `${id}-hint`;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1 block text-small font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={ariaDescribedBy}
            className={`min-h-11 w-full rounded-xl border bg-[var(--background)] px-3 py-2.5 text-body text-[var(--text-primary)] outline-none transition-colors duration-150 ease-out placeholder:text-[var(--text-muted)] focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 dark:focus-visible:ring-offset-[var(--background)] ${
              leftIcon ? "pl-10" : ""
            } ${rightIcon || rightAction ? "pr-10" : ""} ${
              hasError
                ? "border-error focus-visible:border-error focus-visible:ring-2 focus-visible:ring-error/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[var(--background)]"
                : "border-[var(--border)] dark:border-[var(--border)]"
            } ${className}`}
            {...props}
          />
          {rightAction && (
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
              {rightAction}
            </div>
          )}
          {rightIcon && !rightAction && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1 text-small text-error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className="mt-1 text-caption text-neutral-500 dark:text-neutral-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
