import Papa from "papaparse"
import fs from "fs"
import { DateTime } from "luxon"
import { getDBConnection } from "./db"
import { parseAmount } from "./scraperUtils"

/**
 * This script loads a csv file containg spending data in gov.uk/HMRC format
 * into the `spend_transactions` table in a SQLite database.
 *
 * Some basic validation is performed.
 */

// Common data format of _some_ of the spend files.
// Might have to support other formats in the future but this is ok for HMRC & DfT
type GovUKData = {
  "Department family": string
  Entity: string
  Date: string
  "Expense type": string
  "Expense area": string
  Supplier: string
  "Transaction number": string
  Amount: string
  Description: string
  "Supplier Postcode": string
}

// Corresponds to the spend_transactions table in the database
type SpendTransaction = {
  buyer_name: string
  supplier_name: string
  amount: number
  transaction_timestamp: string // should be iso format
}

// TODO: We might have to support other date formats in the future
// See https://moment.github.io/luxon/#/parsing
export const isoTsp = (date: string) => {
  const result = DateTime.fromFormat(
    date,
    "dd/MM/yyyy"
  ).toISO()

  if (!result) {
    throw new Error(
      `Invalid transaction timestamp ${date}.`
    )
  }

  return result
}

async function main(filePath: string) {
  console.log(`Reading ${filePath}.`)
  const csvContent = fs.readFileSync(filePath, { encoding: "utf8" })
  const csvData = Papa.parse<GovUKData>(csvContent, {
    header: true,
    skipEmptyLines: true, // some files have empty newlines at the end
  }).data

  const spendTransactions: SpendTransaction[] = csvData.map(row => {
    return {
      buyer_name: row["Entity"],
      supplier_name: row["Supplier"],
      amount: parseAmount(row["Amount"]),
      transaction_timestamp: isoTsp(row["Date"]),
    }
  }).filter(transaction => transaction.buyer_name !== '')

  const knexDb = await getDBConnection()
  await knexDb.batchInsert('spend_transactions', spendTransactions, 200)
  console.log("Finished writing to the DB.")
  await knexDb.destroy()
}

const filePath = "./sample_data/Transparency_DfE_Spend_July_2023__1_.csv"

main(filePath)
