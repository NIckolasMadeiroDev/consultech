import type { TransactionType } from "./calculateBalance";

export type ValidateTransactionInput = {
  type: TransactionType;
  amount: number;
  categoryId?: string | null;
  paymentMethodId?: string | null;
  cashboxOriginId?: string | null;
  cashboxDestId?: string | null;
};

export type ValidationError = { field: string; message: string };

function validateAmount(amount: number, errors: ValidationError[]): void {
  if (amount <= 0) {
    errors.push({ field: "amount", message: "Valor deve ser positivo." });
  }
}

function validateType(type: TransactionType, errors: ValidationError[]): void {
  const validTypes: TransactionType[] = ["entry", "exit", "transfer", "withdraw", "supply"];
  if (!validTypes.includes(type)) {
    errors.push({ field: "type", message: "Tipo de movimentação inválido." });
  }
}

function validateEntryExitRequirements(
  input: ValidateTransactionInput,
  errors: ValidationError[]
): void {
  if (input.type !== "entry" && input.type !== "exit") return;
  if (!input.categoryId?.trim()) {
    errors.push({ field: "categoryId", message: "Categoria é obrigatória." });
  }
  if (!input.paymentMethodId?.trim()) {
    errors.push({ field: "paymentMethodId", message: "Forma de pagamento é obrigatória." });
  }
}

function validateCashboxRequirements(
  input: ValidateTransactionInput,
  errors: ValidationError[]
): void {
  if (input.type === "entry" || input.type === "supply") {
    if (!input.cashboxDestId?.trim()) {
      errors.push({ field: "cashboxDestId", message: "Caixa de destino é obrigatório." });
    }
  }
  if (input.type === "exit" || input.type === "withdraw") {
    if (!input.cashboxOriginId?.trim()) {
      errors.push({ field: "cashboxOriginId", message: "Caixa de origem é obrigatório." });
    }
  }
  if (input.type === "transfer") {
    if (!input.cashboxOriginId?.trim()) {
      errors.push({ field: "cashboxOriginId", message: "Caixa de origem é obrigatório na transferência." });
    }
    if (!input.cashboxDestId?.trim()) {
      errors.push({ field: "cashboxDestId", message: "Caixa de destino é obrigatório na transferência." });
    }
    if (input.cashboxOriginId === input.cashboxDestId) {
      errors.push({ field: "cashboxDestId", message: "Origem e destino devem ser diferentes." });
    }
  }
}

/**
 * Valida dados de uma transação antes de persistir.
 */
export function validateTransaction(input: ValidateTransactionInput): ValidationError[] {
  const errors: ValidationError[] = [];
  validateAmount(input.amount, errors);
  validateType(input.type, errors);
  validateEntryExitRequirements(input, errors);
  validateCashboxRequirements(input, errors);
  return errors;
}
