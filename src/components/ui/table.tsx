"use client";

import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({ className = "", children, ...props }: Readonly<HTMLAttributes<HTMLTableElement>>) {
  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full border-collapse text-body text-[var(--text-primary)] ${className}`}
        {...props}
      >
        <caption className="sr-only">Tabela de dados</caption>
        {children}
      </table>
    </div>
  );
}

export function TableHeader(props: Readonly<HTMLAttributes<HTMLTableSectionElement>>) {
  return <thead {...props} />;
}

export function TableBody(props: Readonly<HTMLAttributes<HTMLTableSectionElement>>) {
  return <tbody {...props} />;
}

export function TableRow({
  className = "",
  ...props
}: Readonly<HTMLAttributes<HTMLTableRowElement>>) {
  return (
    <tr
      className={`border-b border-neutral-200 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/50 ${className}`}
      {...props}
    />
  );
}

export function TableHead({
  className = "",
  ...props
}: Readonly<ThHTMLAttributes<HTMLTableCellElement>>) {
  return (
    <th
      className={`px-lg py-md text-left text-small font-semibold text-[var(--text-secondary)] ${className}`}
      {...props}
    />
  );
}

export function TableCell({
  className = "",
  ...props
}: Readonly<TdHTMLAttributes<HTMLTableCellElement>>) {
  return <td className={`px-lg py-md ${className}`} {...props} />;
}
