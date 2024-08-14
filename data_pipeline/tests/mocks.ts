// @ts-nocheck
import type { Http, KnexDb, PapaParse } from '../src/types'

export const mockPapa = (sampleCsv: object): PapaParse => {
	return {
		parse: jest.fn().mockImplementation((content: string, options: Papa.ParseConfig) => {
			console.log("Mock Papa.parse called with:", content, options);
			// Simulate the behavior of Papa.parse
			return {
				data: sampleCsv,
				errors: [],
				meta: {
					// add other metadata fields if needed
				},
			};
		}),
	}
}
