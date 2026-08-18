/** Replicates AngularJS `{{ value | currency:"\u00a3" }}`. */
export function currency(value: number, symbol = '\u00a3'): string {
  return `${symbol}${value.toFixed(2)}`;
}
