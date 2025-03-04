const Log = require("../../models/log");

describe('log functions', () => {

	it('should be able to generate a log record', async () => {
		//
		const user_id = "1"
		const type = Log.LOGSERVICE.transaction_file_retrieval
		const message = "some message"
		const info = "some info"
		//
		const logRecord = Log.LOGSERVICE.createLogRecord(user_id, type, message, info)
		//
		expect(logRecord._id).toBeTruthy()
		expect(logRecord.user_id).toEqual(user_id)
		expect(logRecord.type).toEqual(type)
		expect(logRecord.message).toEqual(message)
		expect(logRecord.info).toEqual(info)
		//
	})

})
