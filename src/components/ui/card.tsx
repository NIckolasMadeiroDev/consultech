"use client";

import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-sm",
  md: "p-lg",
  lg: "p-xl",
};

export function Card({
  padding = "md",
  className = "",
  children,
  ...props
}: Readonly<CardProps>) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-[var(--surface)] shadow-sm transition-colors duration-150 dark:border-neutral-700 ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={`border-b border-neutral-200 pb-lg dark:border-neutral-700 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: Readonly<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3 className={`text-h4 text-[var(--text-primary)] ${className}`} {...props}>
      {children ?? "\u00A0"}
    </h3>
  );
}

export function CardContent({
  className = "",
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={`pt-lg ${className}`} {...props} />;
}
