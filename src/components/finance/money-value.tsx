"use client";

export type MoneyVariant = "entry" | "exit" | "neutral" | "balance-negative";

const variantClasses: Record<MoneyVariant, string> = {
  entry: "text-[var(--finance-entry)]",
  exit: "text-[var(--finance-exit)]",
  neutral: "text-[var(--finance-neutral)]",
  "balance-negative": "text-[var(--finance-exit)]",
};

const sizeClasses = {
  balance: "font-mono text-finance-balance",
  dashboard: "font-mono text-finance-dashboard",
  table: "font-mono text-finance-table",
  aux: "font-mono text-finance-aux",
};

type MoneyValueProps = Readonly<{
  value: number;
  variant?: MoneyVariant;
  size?: keyof typeof sizeClasses;
  showSign?: boolean;
  className?: string;
}>;

function formatMoneyDisplay(value: number, showSign: boolean): string {
  const numStr = formatNum(value);
  if (!showSign) return `R$ ${numStr}`;
  if (value >= 0) return `+ R$ ${numStr}`;
  return `- R$ ${formatNum(Math.abs(value))}`;
}

export function MoneyValue({
  value,
  variant = "neutral",
  size = "table",
  showSign = false,
  className = "",
}: MoneyValueProps) {
  const formatted = formatMoneyDisplay(value, showSign);
  return (
    <span
      className={`tabular-nums ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      aria-label={formatted}
    >
      {formatted}
    </span>
  );
}

function formatNum(n: number): string {
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
