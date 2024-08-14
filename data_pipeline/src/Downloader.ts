import { DateTime } from "luxon"
import { parseAmount } from "../../scraperUtils"

import type { Http, KnexDb, PapaParse } from './types'
import type { ApiResponse, GovUKData, SpendTransaction } from './types'


/*
 * Downloader
 * 
 * */
function Downloader(db: KnexDb, httpCaller: Http, csvHandler: PapaParse) {
	const isoTsp = (date: string) => {
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

	const start = async (url: string) => {
		// TODO: error handling needed on http requests
		const jsonResponse = await httpCaller(url)
		const resp = await jsonResponse.json() as ApiResponse
		const csvUrl = resp.details.attachments[0].url

		const csvContent = await httpCaller(csvUrl).then((res: Response) => res.text())

		console.log(`CSV for URL ${url.split("/").pop()} downloaded to memory.`)

		const csvData = csvHandler.parse<GovUKData>(csvContent, {
			header: true,
			skipEmptyLines: true, // some files have empty newlines at the end
		}).data

		const spendTransactions: (SpendTransaction | null)[] = csvData.map(row => {
			try {
				return {
					buyer_name: row["Entity"],
					supplier_name: row["Supplier"],
					amount: parseAmount(row["Amount"]),
					transaction_timestamp: isoTsp(row["Date"]),
				}
			} catch (err) {
				return null
			}
		}).filter(transaction => transaction?.buyer_name !== '')

		await db.batchInsert('spend_transactions', spendTransactions, 200)
		console.log("Finished writing to the DB.")

		return csvContent
	}

	return {
		start,
	}
}

export default Downloader

