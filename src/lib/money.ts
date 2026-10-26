/**
 * Amounts as every Minty screen writes them (owner, 2026-10-21): the ISO code, a NON-BREAKING
 * space, then the number grouped - "HKD 1,234.50", never a symbol. A price drops a trailing ".00"
 * ("HKD 400", but "HKD 400.50"). This is @minty/shared/money's formatPrice, which this site does
 * not depend on; the output must stay identical, so change the two together.
 */
export const CODE_SPACE = "\u00a0";

export function formatPrice(amount: number, currencyCode: string): string {
  const number = amount
    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/\.00$/, "");
  return `${currencyCode}${CODE_SPACE}${number}`;
}
