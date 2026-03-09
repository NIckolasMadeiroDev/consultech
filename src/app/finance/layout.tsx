import type { Metadata } from "next";
import { FinanceLayoutClient } from "./FinanceLayoutClient";

export const metadata: Metadata = {
  title: "Financeiro | Consultech",
  description: "Módulo financeiro: caixa, movimentações, fluxo de caixa e relatórios.",
};

export default function FinanceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <FinanceLayoutClient>{children}</FinanceLayoutClient>;
}
