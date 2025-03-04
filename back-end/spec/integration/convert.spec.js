
const axios = require("axios");

const baseURL = "http://localhost:8080/"
const token = "2398vruy2m389rufv2m398ufvj2398rufv2938ruvbmn29r8uv2mn3r9"

describe('FTP Convert endpoints', () => {

	beforeAll(async () => {
		// Integration tests take time...
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 2147483647
		//
		// await S3SERVICE.deleteTestFolder()
		//
	})

	fit('should be able to convert the FTP csv files', async () => {
		//
		try {
			//
			const processResult = await axios({
				baseURL: baseURL,
				url: "/process",
				method: "POST",
				headers: {
					"Token": token,
					"Content-Type": "text/plain",
					"Process": "all"
				},
			})
			//
			expect(processResult.status).toBe(200)
			//
		} catch (e) {
			//
			console.log(e.response.data)
			throw new Error("Unable to process job")
			//
		}
		//
	})
})
