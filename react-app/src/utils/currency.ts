/** Replicates AngularJS `{{ value | currency:"\u00a3" }}`, including group separators. */
export function currency(value: number, symbol = '\u00a3'): string {
  const amount = value.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${amount}`;
}
