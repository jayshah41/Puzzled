const Config = require("../../config")
const DB = require("../../models/db");
const { nanoid } = require("nanoid");
// const User = require("../../models/user")

let connectionInfo;

describe('DB functions', () => {

	// Every test can assume a connection
	beforeAll(async () => {
		//
		// console.log("Before All")
		//
		connectionInfo = await DB.DBSERVICE.connect()
		expect(connectionInfo.outcome).toBe(1)
		await DB.DBSERVICE.sanityCheck(connectionInfo.db)
		//
	})

	afterAll(async () => {
		//
		// console.log("After All")
		//
		await DB.DBSERVICE.closeConnection(connectionInfo.client)
	})

	// Every test can assume a clean database with all tables existing
	beforeEach(async () => {
		await tableCleanup()
	});

	const tableCleanup = async () => {
		// The test is a fail safe to make sure only the test DB would ever be cleared
		if (process.env.NODE_ENV === "test") {
			//
			const userCollection = connectionInfo.db.collection('users')
			await userCollection.deleteMany({})
			//
		}
		//
	}

	// const createTestUserAndGetTestUser = async () => {
	// 	//
	// 	const email = nanoid() + "@test.test"
	// 	const password = "test"
	// 	const userRecord = {
	// 		_id: nanoid(),
	// 		email: email,
	// 		password: password
	// 	}
	// 	// We should not tie this to the user model...
	// 	// const userRecord = User.USERSERVICE.createUserRecord(email, password)
	// 	const createUserResult = await DB.DBSERVICE.createUser(connectionInfo.db, userRecord)
	// 	expect(createUserResult.outcome).toBe(1)
	// 	//
	// 	const getUserResult = await DB.DBSERVICE.getUser(connectionInfo.db, email)
	// 	expect(getUserResult.outcome).toBe(1)
	// 	//
	// 	let returnedUserRecord = getUserResult.userRecord
	// 	//
	// 	return returnedUserRecord
	// 	//
	// }

	it('should be able to create and delete a user', async () => {
		//
		const email = nanoid() + "@test.test"
		const password = "test"
		const userRecord = {
			_id: nanoid(),
			email: email,
			password: password
		}
		// We should not tie this to the user model...
		// const userRecord = User.USERSERVICE.createUserRecord(email, password)
		//
		const createUserResult = await DB.DBSERVICE.createUser(connectionInfo.db, userRecord)
		expect(createUserResult.outcome).toBe(1)
		//
		const deleteUserResult = await DB.DBSERVICE.deleteUser(connectionInfo.db, email)
		expect(deleteUserResult.outcome).toBe(1)
		//
	})

	it('should be able to get a user record', async () => {
		//
		const email = nanoid() + "@test.test"
		const password = "test"
		const userRecord = {
			_id: nanoid(),
			email: email,
			password: password
		}
		// We should not tie this to the user model
		// const userRecord = User.USERSERVICE.createUserRecord(email, password)
		const createUserResult = await DB.DBSERVICE.createUser(connectionInfo.db, userRecord)
		expect(createUserResult.outcome).toBe(1)
		//
		const getUserResult = await DB.DBSERVICE.getUser(connectionInfo.db, email)
		expect(getUserResult.outcome).toBe(1)
		//
		let returnedUserRecord = getUserResult.userRecord
		expect(returnedUserRecord).toEqual(userRecord)
		//
	})

	it('should be able to create a log record', async () => {
		//
		const user_id = "1"
		const type = "SomeType"
		const message = "/SUP001/PO/001.pdf"
		const info = ""
		const logRecord = {
			user_id: user_id,
			type: type,
			message: message,
			info: info,
		}
		//
		const createLogResult = await DB.DBSERVICE.createLog(connectionInfo.db, logRecord)
		expect(createLogResult.outcome).toBe(1)
		//
		// const getUserResult = await DB.DBSERVICE.getUser(connectionInfo.db, email)
		// expect(getUserResult.outcome).toBe(1)
		// //
		// let returnedUserRecord = getUserResult.userRecord
		// expect(returnedUserRecord).toEqual(userRecord)
		//
	})

})
