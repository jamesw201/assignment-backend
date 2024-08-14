import { DateTime } from "luxon"
import Papa from "papaparse"
import { getDBConnection } from "./db"
import { parseAmount } from "./scraperUtils"

type Attachment = {
  accessible: string,
  alternative_format_contact_email: string,
  attachment_type: string,
  command_paper_number: string,
  content_type: string,
  file_size: number,
  filename: string,
  hoc_paper_number: string,
  id: string,
  isbn: string,
  preview_url: string,
  title: string,
  unique_reference: string,
  unnumbered_command_paper: boolean,
  unnumbered_hoc_paper: boolean,
  url: string,
}

type Details = {
  attachments: Attachment[],
}

type Document = {
  analytics_identifier?: string,
  public_updated_at: string,
  api_path: string,
  api_url: string,
  base_path: string,
  content_id: string,
  document_type: string,
  links: object,
  details?: Details,
  locale: string,
  schema_name: string,
  title: string,
  web_url: string,
  withdrawn?: boolean,
}

type Links = {
  available_translations: Document[],
  documents: Document[],
  government: Document[],
  organisations: Document[],
  original_primary_publishing_organisation: Document[],
  primary_publishing_organisation: Document[],
  suggested_ordered_related_items: Document[],
  taxons: Document[],
}

type ApiResponse = {
  details: {
    attachments: Attachment[],
  }
}

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

type SpendTransaction = {
  buyer_name: string
  supplier_name: string
  amount: number
  transaction_timestamp: string // should be iso format
}

const isoTsp = (date: string) => {
  const result = DateTime.fromFormat(
    date,
    "dd/MM/yyyy"
  ).toISO()

  if (!result) {
    // throw new Error(
    //   `Invalid transaction timestamp ${date}.`
    // )
    return DateTime.now().toISO()
  }

  return result
}

async function processUrl(url: string) {
  // TODO: error handling needed on http requests
  const jsonResponse = await fetch(url)
  const resp = await jsonResponse.json() as ApiResponse
  const csvUrl = resp.details.attachments[0].url

  const csvContent = await fetch(csvUrl).then(res => res.text())

  console.log(`CSV for URL ${url.split("/").pop()} downloaded to memory.`)

  const csvData = Papa.parse<GovUKData>(csvContent, {
    header: true,
    skipEmptyLines: true, // some files have empty newlines at the end
  }).data

  // TODO: fix error handling for amount and transaction_timestamp
  const spendTransactions: SpendTransaction[] = csvData.map(row => {
    return {
      buyer_name: row["Entity"],
      supplier_name: row["Supplier"],
      amount: parseAmount(row["Amount"]) || 0,
      transaction_timestamp: isoTsp(row["Date"]) || "my made up date",
    }
  }).filter(transaction => transaction.buyer_name !== '')

  const knexDb = await getDBConnection()
  await knexDb.batchInsert('spend_transactions', spendTransactions, 200)
  console.log("Finished writing to the DB.")
  await knexDb.destroy()

  return csvContent
}

async function main() {
  const PQueue = await import('p-queue').then(pq => pq.default)
  const queue = new PQueue({
    concurrency: 2,  // No more than 2 tasks running at the same time
    interval: 1000,  // Interval of 1000 milliseconds (1 second)
    intervalCap: 2   // No more than 2 tasks within each 1000ms interval
  })

  queue.onEmpty().then(() => {
    console.log('All tasks completed.')
  })

  const response = await fetch(
    "https://www.gov.uk/api/content/government/collections/spending-over-25-000"
    // "https://www.gov.uk/api/content/government/collections/dfe-department-and-executive-agency-spend-over-25-000"
  )
  const data = await response.json()
  const links: Links = data.links

  // Get links from "documents" where the public_updated_at field is between date1 -> date2
  const startDate = DateTime.fromISO('2020-02-01')
  const docsSince2020 = links.documents.filter(doc => DateTime.fromISO(doc.public_updated_at) > startDate)

  console.log("docs since 2020", docsSince2020.length)
  console.log("first doc", docsSince2020[docsSince2020.length - 1].public_updated_at)

  // Request the link found at api_url
  const childUrls = docsSince2020.map(doc => doc.api_url)
  console.log("childUrls", childUrls)

  childUrls.forEach(url => {
    queue.add(() => processUrl(url))
  })
}

main()
