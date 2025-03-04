const Config = require("../config")
const Bcrypt = require("bcryptjs")
const { nanoid } = require("nanoid");

// Nanoid collision maths:
// https://zelark.github.io/nano-id-cc/

exports.USERSERVICE = {

	createUserRecord(
		email,
		password,
		first_name,
		last_name,
		mobile,
		state,
		country,
		referred_by,
		top_3_commodities,
		investment_criteria,
	) {
		return {
			//
			_id: nanoid(),
			//
			email: email,
			password: password,
			//
			tier: "",
			paid_until: "",
			paid_date: "",
			paid_amount: 0,
			package_id: 0,
			//
			admin: false,
			//
			first_name: first_name,
			last_name: last_name,
			mobile: mobile,
			state: state,
			country: country,
			referred_by: referred_by,
			top_3_commodities: top_3_commodities,
			investment_criteria: investment_criteria,
			is_verified: !1,    // default false
			//
		}
	},

	cleanEmail(dirtyEmail) {
		//
		const lowerCaseEmail = dirtyEmail.toLowerCase();
		//
		const trimmedEmail = lowerCaseEmail.trim()
		//
		const trimmedEmailSpaces = trimmedEmail.split("").filter(element => { return element === " " })
		if (trimmedEmailSpaces.length > 0) {
			return {
				outcome: 0,
				cleanEmail: dirtyEmail
			}
		} else {
			//
			return {
				outcome: 1,
				cleanEmail: trimmedEmail
			}
			//
		}
		//
	},

	updateUserRecordWithPayment(existingUserRecord, newTier, paid_until, paid_date, paid_amount, package_id) {
		return {
			...existingUserRecord,
			tier: newTier,
			paid_until: paid_until,
			paid_date: paid_date,
			paid_amount: paid_amount,
			package_id: package_id
		}
	},

	cleanPassword(dirtyPassword) {
		//
		const trimmedPassword = dirtyPassword.trim()
		//
		return {
			outcome: 1,
			cleanPassword: trimmedPassword
		}
		//
	},

	async hashPassword(password) {
		//
		return await Bcrypt.hash(password, Config.SECURITY.saltRound);
	},

	async checkPassword(password, hashed_password) {
		//
		const compareResult = await Bcrypt.compare(password, hashed_password);
		if (compareResult) {
			return {
				outcome: 1
			}
		} else {
			return {
				outcome: 0
			}
		}
		//
	}

};
