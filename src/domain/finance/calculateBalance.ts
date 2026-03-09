/**
 * Regras de domínio: cálculo de saldo.
 * saldo = entradas - saídas (por caixa ou global).
 */

export type TransactionType = "entry" | "exit" | "transfer" | "withdraw" | "supply";

export type TransactionForBalance = {
  type: TransactionType;
  amount: number;
  cashboxOriginId?: string | null;
  cashboxDestId?: string | null;
};

/**
 * Calcula saldo a partir de uma lista de transações.
 * Entradas (entry, supply) somam; saídas (exit, withdraw) subtraem.
 * Transferência: debita origem e credita destino (não entra no saldo global).
 */
export function calculateBalance(transactions: TransactionForBalance[]): number {
  let balance = 0;
  for (const t of transactions) {
    if (t.type === "entry" || t.type === "supply") {
      balance += t.amount;
    } else if (t.type === "exit" || t.type === "withdraw") {
      balance -= t.amount;
    }
    // transfer: não altera saldo global (débito em um, crédito em outro)
  }
  return Math.round(balance * 100) / 100;
}

/**
 * Calcula saldo de um caixa específico.
 * Considera: entradas no caixa (cashboxDestId), saídas do caixa (cashboxOriginId),
 * transferências (origem = debita, destino = credita), sangria (origin), suprimento (dest).
 */
type TxForCashbox = TransactionForBalance & {
  cashboxOriginId?: string | null;
  cashboxDestId?: string | null;
};

function deltaForCashbox(t: TxForCashbox, cashboxId: string): number {
  if (t.type === "entry" || t.type === "supply") {
    return t.cashboxDestId === cashboxId ? t.amount : 0;
  }
  if (t.type === "exit" || t.type === "withdraw") {
    return t.cashboxOriginId === cashboxId ? -t.amount : 0;
  }
  if (t.type === "transfer") {
    let d = 0;
    if (t.cashboxOriginId === cashboxId) d -= t.amount;
    if (t.cashboxDestId === cashboxId) d += t.amount;
    return d;
  }
  return 0;
}

export function calculateCashboxBalance(
  cashboxId: string,
  transactions: TxForCashbox[]
): number {
  let balance = 0;
  for (const t of transactions) {
    balance += deltaForCashbox(t, cashboxId);
  }
  return Math.round(balance * 100) / 100;
}
