const jwt = require("jsonwebtoken");

exports.JWTSERVICE = {

	// sign(opts) {
	// 	const { data, secret, options } = opts;
	// 	return new Promise((resolve, reject) => {
	// 		jwt.sign(data, secret, options, (err, token) => {
	// 			if (err) {
	// 				reject(err);
	// 			}
	// 			else {
	// 				resolve(token);
	// 			}
	// 		});
	// 	});
	// },

	async sign(opts) {
		try {
			//
			const { data, secret, options } = opts;
			const token = await jwt.sign(data, secret, options)
			// var decoded = jwt.verify(token, 'wrong-secret');
			return {
				outcome: 1,
				token: token
			}
			//
		} catch (err) {
			//
			return {
				outcome: 0
			}
			//
		}
	},

	// async verify(opts) {
	// 	const decoded = await jwt.decode(opts);
	// 	return decoded;
	// },

	async verify(token, secret) {
		try {
			//
			var decoded = await jwt.verify(token, secret);
			//
			return {
				outcome: 1,
				decoded: decoded
			}
			//
		} catch (err) {
			//
			return {
				outcome: 0
			}
			//
		}
	},


};
