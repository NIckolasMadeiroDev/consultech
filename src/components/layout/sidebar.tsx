"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const SIDEBAR_WIDTH = "260px";

export interface SidebarItem {
  readonly href: string;
  readonly label: string;
  readonly icon?: ReactNode;
}

export interface SidebarProps {
  readonly brand?: ReactNode;
  readonly items: SidebarItem[];
  readonly footer?: ReactNode;
}

export function Sidebar({ brand, items, footer }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className="flex h-full w-[260px] flex-col border-r border-neutral-200 bg-[var(--surface)] dark:border-neutral-700"
      style={{ width: SIDEBAR_WIDTH }}
      aria-label="Menu principal"
    >
      {brand && (
        <div className="flex h-16 shrink-0 items-center border-b border-neutral-200 px-lg dark:border-neutral-700">
          {brand}
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-md">
        <ul className="flex flex-col gap-xs">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-md py-sm text-body text-[var(--text-primary)] transition-colors duration-150 ease-out hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                    isActive
                      ? "bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      : "text-[var(--text-secondary)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {footer && (
        <div className="shrink-0 border-t border-neutral-200 p-md dark:border-neutral-700">
          {footer}
        </div>
      )}
    </aside>
  );
}
