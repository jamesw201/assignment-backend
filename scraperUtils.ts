/**
 * Converts text containing a monetary amount into a number.
 * Throws if the text can't be parsed
 *
 * @param text - text representation of the amount
 * @returns extracted amount as a number
 */
export function parseAmount(text: string): number | null {
  const amount = Number.parseFloat(text.replace(/[,£]/gi, ''))
  if (isNaN(amount)) {
    // TODO: I've broken this, I want to return a value instead of an Error. Need to log and push a record to an audit table so that the request can be retrired
    // throw new Error(`Invalid amount format: ${text}.`)
    return null
  }
  return amount
}
