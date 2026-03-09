/**
 * Combina classes condicionalmente (padrão para componentes UI).
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
