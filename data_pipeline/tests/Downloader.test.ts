// @ts-nocheck
import { jest } from '@jest/globals'
import Papa from "papaparse"

import type { Http, KnexDb, PapaParse } from '../src/types'
import Downloader from '../src/Downloader'

import { mockPapa } from './mocks'

import sampleJson from './data/item.json'



describe('Data Pipeline: Downloader', () => {

	test('processUrls processes URLs correctly', async () => {
		const reportUrl = "https://www.gov.uk/api/content/government/publications/hmrc-spending-over-25000-june-2024"
		const csvUrl = "https://assets.publishing.service.gov.uk/media/66a36c16ce1fd0da7b592d9c/HMRC_spending_over_25000_for_June_2024.csv"

		const sampleCsv = Papa.parse<GovUKData>("./data/spending.csv", {
			header: true,
			skipEmptyLines: true, // some files have empty newlines at the end
		}).data

		const mockHttp: Http = jest.fn().mockImplementation((url) => {
			console.log("url", url)

			if (url === reportUrl) {
				return Promise.resolve({
					ok: true,
					status: 200,
					json: async () => (sampleJson),
				} as Response);
			} else if (url === csvUrl) {
				return Promise.resolve({
					ok: true,
					status: 200,
					text: async () => (sampleCsv),
				} as Response);
			}
		})

		const mockKnexDb: KnexDb = {
			batchInsert: jest.fn().mockResolvedValue(undefined),
			destroy: jest.fn().mockResolvedValue(undefined),
		}

		// Didn't really want to mock this but Papa complained about the mocked csv data 
		const mockPapaParse = mockPapa(sampleCsv)

		const downloader = Downloader(mockKnexDb, mockHttp, mockPapaParse)
		await downloader.start(reportUrl)

		expect(mockKnexDb.batchInsert).toHaveBeenCalledTimes(2)
	})

})

