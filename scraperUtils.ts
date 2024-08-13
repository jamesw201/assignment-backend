/**
 * Converts text containing a monetary amount into a number.
 * Throws if the text can't be parsed
 *
 * @param text - text representation of the amount
 * @returns extracted amount as a number
 */
export function parseAmount(text: string): number {
  const amount = Number.parseFloat(text.replace(/[,£]/gi, ''))
  if (isNaN(amount)) {
    throw new Error(`Invalid amount format: ${text}.`);
  }
  return amount;
}
