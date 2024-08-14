import Papa from "papaparse"

import ContentDownloader from "./Downloader"
import URLFrontier from "./URLFrontier"
import { getDBConnection } from "../../db"
import type { Downloader, Frontier } from './types'


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

	const knexDb = await getDBConnection()

	// @ts-ignore
	const downloader: Downloader = ContentDownloader(knexDb, fetch, Papa)

	const frontier: Frontier = URLFrontier(queue, fetch, downloader)
	await frontier.start()

	await knexDb.destroy()
}

main().then(res => res)
