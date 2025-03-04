const Config = require("../config");
const { MongoClient } = require('mongodb');
// const { nanoid } = require("nanoid");

// Add new collections to this list
const collectionsList = [
	"users",
	"logs"
]

exports.DBSERVICE = {

	async connect() {
		//
		let uri = ""
		let dbName = ""
		//
		console.log("Environment: " + Config.MONGODB_DEVELOPMENT.serverString)
		//
		switch (Config.ENVIRONMENT.environment) {
			case "development":
				console.log("#########",Config.MONGODB_DEVELOPMENT.serverString)
				uri = Config.MONGODB_DEVELOPMENT.serverString;
				dbName = Config.MONGODB_DEVELOPMENT.database;
				break;
			case "production":
				uri = Config.MONGODB_PRODUCTION.serverString;
				dbName = Config.MONGODB_PRODUCTION.database;
				break;
			case "test":
				uri = Config.MONGODB_TEST.serverString;
				dbName = Config.MONGODB_TEST.database;
				break;
			default:
				uri = Config.MONGODB_DEVELOPMENT.serverString;
				dbName = Config.MONGODB_DEVELOPMENT.database;
				break;
		}
		//
		try {
			// Create a new MongoClient
			const client = new MongoClient(uri, {
				useUnifiedTopology: true
			});
			//
			await client.connect()
			//
			// Establish and verify connection
			await client.db("admin").command({ ping: 1 });
			if (Config.ENVIRONMENT.environment !== "test") {
				console.log("Connected successfully to MONGO DB:" + Config.ENVIRONMENT.environment);
			}
			//
			const db = client.db(dbName);
			//
			await this.sanityCheck(db)
			//
			return {
				outcome: 1,
				db: db,
				client: client,
			};
			//
		} catch (e) {
			//
			console.log("Could not connect to MONGO DB: " + Config.ENVIRONMENT.environment);
			console.log({ e })
			//
			return {
				outcome: 0
			}
			//
		}
	},

	async closeConnection(client) {
		await client.close();
		if (Config.ENVIRONMENT.environment !== "test") {
			console.log("Connection to MONGO DB closed")
		}
	},

	async sanityCheck(db) {
		//
		const collections = await db.listCollections().toArray()
		const collectionNames = collections.map(collection => { return collection.name })
		//
		// Check if each of our required collections (in the global collectionsList) exists in the collectionNames from the DB
		for (const name of collectionsList) {
			const filteredCollections = collectionNames.filter(collection => { return collection === name })
			if (filteredCollections.length === 0) {
				await db.createCollection(name)
			}
		}
		//
	},

	async createUser(db, userRecord) {
		//
		const userCollection = db.collection('users');
		//
		const userCreationResult = await userCollection.insertOne(userRecord)
		//
		if (userCreationResult.insertedCount === 1) {
			return {
				outcome: 1
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async createPaymentHistory(db, paymentRecord) {
		//
		const paymentCollection = db.collection('payments');
		//
		const paymentCreationResult = await paymentCollection.insertOne(paymentRecord)
		//
		if (paymentCreationResult.insertedCount === 1) {
			return {
				outcome: 1
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async createContactUs(db, contactusRecord) {
		//
		const contactusCollection = db.collection('contactus');
		//
		const contactusCreateResult = await contactusCollection.insertOne(contactusRecord)
		//
		if (contactusCreateResult.insertedCount === 1) {
			return {
				outcome: 1
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async deleteUser(db, email) {
		//
		const userCollection = db.collection('users');
		//
		const userDeleteResult = await userCollection.deleteOne({ email: email })
		//
		if (userDeleteResult.deletedCount === 1) {
			return {
				outcome: 1
			}
		} else {
			return {
				outcome: 0
			}
		}
		//
	},

	async getUser(db, email) {
		//
		const userCollection = db.collection('users');
		//
		const getUserResult = await userCollection.findOne({ email: email })
		//
		if (getUserResult !== null) {
			return {
				outcome: 1,
				userRecord: getUserResult
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async getPackage(db, id) {
		//
		const packageCollection = db.collection('packages');
		//
		const getPackageResult = await packageCollection.findOne({ _id: id })
		console.log({ id })
		console.log({ getPackageResult })
		//
		if (getPackageResult !== null) {
			return {
				outcome: 1,
				packageRecord: getPackageResult
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async getLinks(db) {
		//
		const linksCollection = db.collection('links');
		//
		const getLinksResult = await linksCollection.findOne({ _id: "1" })
		//
		if (getLinksResult !== null) {
			return {
				outcome: 1,
				links: getLinksResult
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async getPackages(db) {
		//
		const packagesCollection = db.collection('packages');
		//
		const getPackagesResult = await packagesCollection.find().toArray()
		//
		if (getPackagesResult !== null) {
			return {
				outcome: 1,
				packages: getPackagesResult
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async updateLinks(db, newLinks) {
		//
		const linksCollection = db.collection('links');
		//
		const updateLinksResult = await linksCollection.updateOne(
			{ _id: "1" },
			{
				$set: {
					links: newLinks
				}
			}
		)
		//
		if (updateLinksResult !== null) {
			return {
				outcome: 1,
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async updateUser(db, newUserData) {
		//
		const userCollection = db.collection('users');
		//
		const updateUserResult = await userCollection.updateOne(
			{ _id: newUserData._id },
			{
				$set: newUserData
			}
		)
		//
		if (updateUserResult !== null) {
			return {
				outcome: 1,
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async getUserByApiKey(db, apiKey) {
		//
		const userCollection = db.collection('users');
		//
		const getUserResult = await userCollection.findOne({ api_key: apiKey })
		//
		if (getUserResult !== null) {
			return {
				outcome: 1,
				userRecord: getUserResult
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

	async createLog(db, logRecord) {
		//
		const logsCollection = db.collection('logs');
		//
		const logCreationResult = await logsCollection.insertOne(logRecord)
		//
		if (logCreationResult.insertedCount === 1) {
			return {
				outcome: 1
			}
		} else {
			return {
				outcome: 0
			}
		}
	},

};
