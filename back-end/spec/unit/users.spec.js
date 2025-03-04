const User = require("../../models/user");
const { DateTime } = require("luxon");

describe('user functions', () => {
	beforeEach(async () => { });

	it('should be able to trim an email address', async () => {
		//
		const dirtyEmail = "   SometHing@someThing.Something   "
		//
		const cleanEmailResult = User.USERSERVICE.cleanEmail(dirtyEmail)
		if (cleanEmailResult.outcome === 1) {
			expect(cleanEmailResult.cleanEmail).toEqual("something@something.something")
		} else {
			throw new Error("Could not clean email")
		}
		//
	})

	it('should be able to trim a password', async () => {
		//
		const dirtyPassword = "   somepassword   "
		//
		const cleanPasswordResult = User.USERSERVICE.cleanPassword(dirtyPassword)
		//
		expect(cleanPasswordResult.outcome).toBe(1)
		expect(cleanPasswordResult.cleanPassword).toEqual("somepassword")
		//
	})

	it('should be able to detect an email address with a space in it', async () => {
		//
		const dirtyEmail = "   something@ something.something   "
		//
		const cleanEmailResult = User.USERSERVICE.cleanEmail(dirtyEmail)
		//
		expect(cleanEmailResult.outcome).toBe(0)
		//
	})

	it('should be able to encrypt a password and compare a password to the hash', async () => {
		//
		const password = "somepassword"
		//
		const hashed_password = await User.USERSERVICE.hashPassword(password)
		//
		const checkPasswordResult = await User.USERSERVICE.checkPassword(password, hashed_password)
		//
		expect(checkPasswordResult).toEqual({
			outcome: 1
		})
		//
	})

	it('should be able to generate a user record', async () => {
		//
		const password = "somepassword"
		const hashed_password = await User.USERSERVICE.hashPassword(password)
		//
		const newUserRecord = User.USERSERVICE.createUserRecord(
			"email@email.com",
			hashed_password,
		)
		//
		expect(newUserRecord._id).toBeTruthy()
		expect(newUserRecord.email).toEqual("email@email.com")
		expect(newUserRecord.password).toEqual(hashed_password)
		expect(newUserRecord.tier).toEqual("")
		//
	})

	fit('should be able to update a user record after a payment was received', async () => {
		//
		const password = "somepassword"
		const hashed_password = await User.USERSERVICE.hashPassword(password)
		//
		const newUserRecord = User.USERSERVICE.createUserRecord(
			"email@email.com",
			hashed_password,
			"First",
			"Last",
			"Mobile",
			"State",
			"Country",
			"Referred by",
			["1", "2", "3"],
			"INVCRIT"
		)
		//
		expect(newUserRecord._id).toBeTruthy()
		expect(newUserRecord.email).toEqual("email@email.com")
		expect(newUserRecord.password).toEqual(hashed_password)
		expect(newUserRecord.tier).toEqual("")
		//
		const now = DateTime.now()
		const updatedNewUserRecord = User.USERSERVICE.updateUserRecordWithPayment(
			newUserRecord,
			"1",
			now.plus({ years: 1 }),
			now,
			100,
			1
		)
		//
		expect(updatedNewUserRecord.tier).toEqual("1")
		expect(updatedNewUserRecord.paid_until).toEqual(now.plus({ years: 1 }))
		expect(updatedNewUserRecord.paid_date).toEqual(now)
		expect(updatedNewUserRecord.paid_amount).toEqual(100)
		expect(updatedNewUserRecord.package_id).toEqual(1)
		//
	})

})
