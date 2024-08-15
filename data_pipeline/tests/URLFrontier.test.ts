// @ts-nocheck
import { jest } from '@jest/globals'
import Papa from "papaparse"
import type { Downloader, Http, IPQueue } from '../src/types'
import URLFrontier from '../src/URLFrontier'
import ContentDownloader from '../src/Downloader'

import { mockPapa } from './mocks'

import listJson from './data/list.json'
import itemJson from './data/item.json'
import urlsJson from './data/urls.json'

type Frontier = {
	start(): Promise<void>;
}

const mockKnexDb: KnexDb = {
	batchInsert: jest.fn().mockResolvedValue(undefined),
	destroy: jest.fn().mockResolvedValue(undefined),
}

/*
 * URLFrontier.test
 *
 * The tests in this file mock the API and the Queues to check that the business logic in between is doing its job correctly.
 * */
describe('Data Pipeline: URLFrontier', () => {

	test('Retrieve URLs and queue downloaders', async () => {
		const urls = "http://localhost:3001/api/urls/unvisited"
		const listUrl = "https://www.gov.uk/api/content/government/collections/spending-over-25-000"
		const csvUrl = "https://assets.publishing.service.gov.uk/media/66a36c16ce1fd0da7b592d9c/HMRC_spending_over_25000_for_June_2024.csv"

		const sampleCsv = Papa.parse<GovUKData>("./data/spending.csv", {
			header: true,
			skipEmptyLines: true, // some files have empty newlines at the end
		}).data

		const mockHttp: Http = jest.fn().mockImplementation((url) => {
			if (url === urls) {
				console.log("url", url)
				return Promise.resolve({
					ok: true,
					status: 200,
					json: async () => (urlsJson),
				} as Response);
			} else if (url === listUrl) {
				return Promise.resolve({
					ok: true,
					status: 200,
					json: async () => (listJson),
				} as Response);
			} else if (url === csvUrl) {
				return Promise.resolve({
					ok: true,
					status: 200,
					text: async () => (sampleCsv),
				} as Response);
			} else {
				return Promise.resolve({
					ok: true,
					status: 200,
					json: async () => (itemJson),
				} as Response);
			}
		})

		const mockQueue: IPQueue = {
			add: jest.fn().mockImplementation(fn => fn()), // Immediately invoke the task
			onEmpty: jest.fn().mockResolvedValue(undefined),
		}

		const downloader: Downloader = ContentDownloader(mockKnexDb, mockHttp, mockPapa(sampleCsv))
		const frontier: Frontier = URLFrontier(mockQueue, mockHttp, downloader)
		await frontier.start()

		expect(mockQueue.add).toHaveBeenCalledTimes(54)
	})

})
