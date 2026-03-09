/**
 * Formatação de valores financeiros.
 * Padrão: R$ 12.540,90 (moeda + separador milhar + duas decimais).
 */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Ex.: "+ R$ 1.200,00" para entrada, "- R$ 540,00" para saída */
export function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+ ${formatted}` : `- ${formatted}`;
}

/** Parse de input máscara para número (centavos) */
export function parseCurrencyInput(raw: string): number {
  const digits = raw.replaceAll(/\D/g, "");
  if (digits.length === 0) return 0;
  return Number(digits) / 100;
}
