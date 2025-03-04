
// https://www.npmjs.com/package/basic-ftp

const Config = require("../config")
const ftp = require("basic-ftp")

exports.FTPSERVICE = {

	async connect() {
		//
		const client = new ftp.Client(timeout = 0)
		client.ftp.verbose = false
		//
		try {
			await client.access({
				host: Config.FTPSETTINGS.server,
				user: Config.FTPSETTINGS.username,
				password: Config.FTPSETTINGS.password,
				secure: false
			})
			//
			return {
				outcome: 1,
				client: client
			}
			//
		} catch (e) {
			//
			console.log({ e })
			//
			return {
				outcome: 0,
				error: e
			}
			//
		}
	},

	async list(client, path) {
		//
		try {
			// const connectResult = await this.connect()
			// if (connectResult.outcome === 0) {
			// 	return {
			// 		outcome: 0,
			// 		error: connectResult.error
			// 	}
			// }
			// const client = connectResult.client
			//
			await client.cd(path)
			//
			const list = await client.list()
			//
			// client.close()
			//
			return {
				outcome: 1,
				list: list
			}
			//
		}
		catch (err) {
			console.log(err)
		}
		//
	},

	async download(client, localFile, foreignFile) {
		//
		try {
			// const connectResult = await this.connect()
			// if (connectResult.outcome === 0) {
			// 	return {
			// 		outcome: 0,
			// 		error: connectResult.error
			// 	}
			// }
			// const client = connectResult.client
			//
			await client.downloadTo(localFile, foreignFile)
			//
			// client.close()
			//
			return {
				outcome: 1,
			}
			//
		}
		catch (err) {
			//
			console.log(err)
			//
			return {
				outcome: 0
			}
			//
		}
		//
	}

}