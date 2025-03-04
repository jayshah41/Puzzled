const Config = require("../config");

var postmark = require("postmark");

var client = new postmark.ServerClient("5bc3d204-8b6e-459a-a509-d0e7fa2b88ca");

exports.EMAILSERVICE = {

	async sendEmail(
		from,
		to,
		subject,
		htmlBody,
		textBody
	) {
		//
		try {
			//
			client.sendEmail({
				"From": from,
				"To": to,
				"Subject": subject,
				"HtmlBody": htmlBody,
				"TextBody": textBody,
				"MessageStream": "outbound"
			});
			console.log(to)
			//
			return {
				outcome: 1
			}
			//
		} catch (e) {
			//
			console.log({ e })
			//
			return {
				outcome: 0
			}
			//
		}
	}

};
