// const Config = require("../config");
// const moment = require("moment");
const { DateTime } = require("luxon");
const { nanoid } = require("nanoid");

exports.LOGSERVICE = {

	general_type: "General",
	transaction_type: "Transaction",

	user_logged_in_message: "User successfully logged in",
	user_login_issue_message: "User had invalid credentials",
	user_logged_out: "User successfully logged out",

	user_got_info_success: "User got info",
	user_got_info_fail: "User could not get info",

	user_got_package_success: "User got package",
	user_got_package_fail: "User could not get package",

	user_sign_up_success: "User signed up",
	user_sign_up_fail: "User could not sign up",

	user_update_paid_success: "User paid and updated",
	user_update_paid_fail: "User could not update paid record",

	got_links_data_success: "Got Links data",
	got_links_data_fail: "Could not get Links data",

	got_packages_data_success: "Got Packages data",
	got_packages_data_fail: "Could not get Packages data",

	email_success: "Sent an email",
	email_fail: "Could not send an email",

	createLogRecord(user_id, type, message, info) {
		return {
			_id: nanoid(),
			user_id: user_id,
			type: type,
			message: message,
			info: info,
			timestamp: DateTime.now()
		}
	}

};
