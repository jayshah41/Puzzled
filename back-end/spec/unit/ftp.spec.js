
const { FTPSERVICE } = require("../../models/ftp")

describe('FTP functions', () => {

	// Every test can assume a connection
	beforeAll(async () => {
		//
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
		//
	})

	it('should be able to list a directory', async () => {
		//
		const result = await FTPSERVICE.list("/")
		//
		expect(result.outcome).toBe(1)
		//
	})

	it('should be able to download', async () => {
		//
		const result = await FTPSERVICE.download("/tmp/FILE.csv", "/CapitalRaises/CapitalRaises20210310.csv")
		//
		expect(result.outcome).toBe(1)
		//
	})

})