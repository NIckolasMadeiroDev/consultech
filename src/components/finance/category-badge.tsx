"use client";

type CategoryBadgeProps = Readonly<{
  label: string;
  variant?: "entry" | "exit" | "neutral";
  className?: string;
}>;

export function CategoryBadge({
  label,
  variant = "neutral",
  className = "",
}: CategoryBadgeProps) {
  const variantClasses = {
    entry:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    exit: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    neutral:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-small font-medium ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
