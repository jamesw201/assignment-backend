import { DateTime } from "luxon"

import type { Http, IPQueue } from './types'
import type { Downloader, Links } from './types'


interface UrlResponseItem {
	url: string;
}
/*
 * URLFrontier
 * 
 * Calls the /api/url API to get URLs
 * Puts the Tasks on the Queue
 * */
function URLFrontier(queue: IPQueue, httpCaller: Http, downloader: Downloader) {

	const processUrl = async (url: string): Promise<void> => {
		const response = await httpCaller(url)
		const data = await response.json()
		const links: Links = data.links

		const startDate = DateTime.fromISO('2020-02-01')
		const docsSince2020 = links.documents.filter(doc => DateTime.fromISO(doc.public_updated_at) > startDate)

		console.debug("docs since 2020", docsSince2020.length)
		console.log("first doc", docsSince2020[docsSince2020.length - 1].public_updated_at)

		// Request the link found at api_url
		const childUrls = docsSince2020.map(doc => doc.api_url)

		await Promise.all(childUrls.map(url =>
			queue.add(() => downloader.start(url))
		))
	}

	const start = async () => {
		const urlResponse = await httpCaller("http://localhost:3001/api/urls/unvisited")
		const urls: UrlResponseItem[] = await urlResponse.json()

		for (const item of urls) {
			await processUrl(item.url)
		}
	}

	return {
		start,
	}
}

export default URLFrontier

