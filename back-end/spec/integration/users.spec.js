const { nanoid } = require("nanoid")
const axios = require("axios")

const baseURL = "http://localhost:8080"

describe('User functions', () => {

	beforeAll(async () => {
		// Integration tests take time...
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
		//
	})

	it('should be able to sign up a user, then login and receive a JWT, and be able to get info', async () => {
		//
		const email = nanoid() + "@test.test"
		const password = "test"
		const signupResponse = await axios({
			baseURL: baseURL,
			url: "/api/users/signup",
			method: "POST",
			data: {
				email: email,
				password: password,
				first_name: "Joe",
				last_name: "Smith",
				mobile: "1234 123 123",
				state: "Some State",
				country: "Some Country",
				referred_by: "Some Guy",
				top_3_commodities: ["1", "2", "3"],
				investment_criteria: "C",
			},
		});
		//
		expect(signupResponse.status).toBe(204)
		//
		const loginResponse = await axios({
			baseURL: baseURL,
			url: "/api/users/login",
			method: "POST",
			data: {
				email: email,
				password: password
			}
		})
		//
		expect(loginResponse.status).toBe(200)
		expect(loginResponse.data.token).toBeTruthy()
		//
		const getInfoResponse = await axios({
			baseURL: baseURL,
			url: "/api/users/info",
			method: "GET",
			headers: { "Token": loginResponse.data.token },
		})
		//
		expect(getInfoResponse.status).toBe(200)
		expect(getInfoResponse.data.email).toBe(email.toLowerCase())
		expect(getInfoResponse.data.tier).toEqual("")
		//
	})

	it('should be able to sign up a user, then not be able to generate another account with the same email', async () => {
		//
		const email = nanoid() + "@test.test"
		const password = "test"
		const signupResponse = await axios({
			baseURL: baseURL,
			url: "/api/users/signup",
			method: "POST",
			data: {
				email: email,
				password: password,
				contact_name: "Joe",
				mobile: "1234 123 123",
				state: "Some State",
				country: "Some Country",
				referred_by: "Some Guy",
				top_3_commodities: ["1", "2", "3"],
				investment_criteria: "C",
			},
		});
		//
		expect(signupResponse.status).toBe(204)
		//
		try {
			await axios({
				baseURL: baseURL,
				url: "/api/users/signup",
				method: "POST",
				data: {
					email: email,
					password: password,
					contact_name: "Joe",
					mobile: "1234 123 123",
					state: "Some State",
					country: "Some Country",
					referred_by: "Some Guy",
					top_3_commodities: ["1", "2", "3"],
					investment_criteria: "C",
				},
			});
			//
			throw Error("The same email should not be able to be created twice")
			//
		} catch (e) {
			//
			// console.log(e)
			expect(e.response.status).toEqual(409)
			//
		}
		//
	})

	it('should not be able to sign up a user if they have missing data', async () => {
		//
		const email = nanoid() + "@test.test"
		const password = "test"
		try {
			await axios({
				baseURL: baseURL,
				url: "/api/users/signup",
				method: "POST",
				data: {
					email: email,
					password: password,
					contact_name: "Joe",
					mobile: "1234 123 123",
					state: "Some State",
					country: "Some Country",
					// referred_by: "Some Guy",
					top_3_commodities: ["1", "2", "3"],
					investment_criteria: "C",
				},
			});
			//
			throw Error("The user should not be able to signup with incomplete data")
			//
		} catch (e) {
			expect(e.response.status).toBe(400)
		}
		//
	})

})
