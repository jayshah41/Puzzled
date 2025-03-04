const axios = require("axios")
const { Client } = require('@elastic/elasticsearch')

const baseUrl = "https://2a7c8056b1f2467da87bf60504c9774f.us-central1.gcp.cloud.es.io:9243"
//
var data = new Buffer.from('QYRWZXkB3tUdnUDkc0jL:Qz8PBinzTuigjiuh2ncL4g');
var apiKeyRaw = data.toString('base64');
//
// const apiKeyRaw = "T1A2RlNYa0IzdFVkblVEa1NPYmo6dWYzN09tYkFSS0czUXRhV19CbmVSUQ=="
const apiKey = "ApiKey " + apiKeyRaw
const client = new Client({
	node: baseUrl,
	auth: {
		apiKey: apiKeyRaw
	}
})

// https://www.npmjs.com/package/elasticsearch

// To create an apiKey
// 1. Go to Kibana -> Dev Tools -> Console
// 2. Paste this command (Change username and password):
// POST /_security/api_key/grant
// {
// 	"grant_type": "password",
// 		"username" : "data_user",
// 		"password" : "viscux-Sakha5-bozpec",
// 		"api_key" : {
// 		  "name": "my-api-key",
// 			"expiration": "1d",
// 			"role_descriptors": {
// 				"role-a": {
// 					"cluster": ["all"],
// 					"index": [
// 						{
// 							"names": ["*"],
// 							"privileges": ["all"]
// 						}
// 					]
// 				}
// 		  }
// 	  }
// }
// 3. Go to https://www.base64encode.org. Encode this: <id>:<api_key>
// 4. You can now use the encoded key like this with an Authorization header: "ApiKey <Encoded Key>"

exports.ELASTICSERVICE = {

	async uploadDocuments(indexName, documents) {
		//
		// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/bulk_examples.html
		// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.x/api-reference.html
		try {
			//
			const body = documents.flatMap(doc => [{ index: { _index: indexName } }, doc])
			//
			await client.bulk({
				index: indexName,
				// type: string,
				// wait_for_active_shards: string,
				refresh: true,
				// routing: string,
				// timeout: string,
				// _source: string | string[],
				// _source_excludes: string | string[],
				// _source_includes: string | string[],
				// pipeline: string,
				// require_alias: boolean,
				body
			})
			// const ndjson_payload = documents.map(JSON.stringify).join('\n') + '\n'
			// console.log({ ndjson_payload })
			// //
			// const uploadDocumentResult = await axios.put(
			// 	baseUrl + "/" + indexName + "/_bulk",
			// 	{ data: ndjson_payload },
			// 	{
			// 		headers: {
			// 			"Authorization": apiKey,
			// 			"Content-Type": "application/x-ndjson"
			// 		},
			// 	}
			// )
			//
			// console.log({ uploadDocumentResult })
			//
			// if (uploadDocumentResult.status === 201) {
			//
			return {
				outcome: 1
			}
			//
			// } else {
			// 	//
			// 	return {
			// 		outcome: 0
			// 	}
			// 	//
			// }
		} catch (e) {
			//
			console.log(e)
			//
			return {
				outcome: 0
			}
			//
		}
		//
	},

	async getDocuments(indexName) {
		//
		try {
			//
			const uploadDocumentResult = await axios({
				url: baseUrl + "/" + indexName + "/_search",
				method: "GET",
				headers: {
					"Authorization": apiKey
				},
				data: {
					"query": {
						"match_all": {}
					}
				}
			})
			//
			if (uploadDocumentResult.status === 200) {
				//
				return {
					outcome: 1,
					data: uploadDocumentResult.data.hits.hits
				}
				//
			} else {
				//
				return {
					outcome: 0
				}
				//
			}
		} catch (e) {
			//
			console.log(e.response.data.error)
			//
			return {
				outcome: 0
			}
			//
		}
		//
	},

	async deleteAllDocuments(indexName) {
		//
		try {
			//
			const deleteDocumentsResult = await axios({
				url: baseUrl + "/" + indexName + "/_doc/_delete_by_query",
				method: "POST",
				headers: {
					"Authorization": apiKey
				},
				data: {
					"query": {
						"match_all": {}
					}
				}
			})
			//
			if (deleteDocumentsResult.status === 200) {
				//
				return {
					outcome: 1
				}
				//
			} else {
				//
				return {
					outcome: 0
				}
				//
			}
		} catch (e) {
			//
			console.log(e)
			//
			return {
				outcome: 0
			}
			//
		}
		//
	},

	// async createIndex(indexName) {
	// 	//
	// 	try {
	// 		//
	// 		const createIndexResult = await axios({
	// 			url: baseUrl + "/" + indexName,
	// 			method: "PUT",
	// 			headers: {
	// 				"Authorization": apiKey
	// 			},
	// 			body: {
	// 				settings: {
	// 					index: {
	// 						number_of_shards: 1,
	// 						number_of_replicas: 1
	// 					}
	// 				}
	// 			}
	// 		})
	// 		//
	// 		if (createIndexResult.status === 200) {
	// 			//
	// 			return {
	// 				outcome: 1
	// 			}
	// 			//
	// 		} else {
	// 			//
	// 			return {
	// 				outcome: 0
	// 			}
	// 			//
	// 		}
	// 	} catch (e) {
	// 		//
	// 		console.log(e.response.data.error)
	// 		//
	// 		return {
	// 			outcome: 0
	// 		}
	// 		//
	// 	}
	// 	//
	// },

	// async deleteIndex(indexName) {
	// 	//
	// 	try {
	// 		//
	// 		const deleteIndexResult = await axios({
	// 			url: baseUrl + "/" + indexName,
	// 			method: "DELETE",
	// 			headers: {
	// 				"Authorization": apiKey
	// 			},
	// 		})
	// 		//
	// 		if (deleteIndexResult.status === 200) {
	// 			//
	// 			return {
	// 				outcome: 1
	// 			}
	// 			//
	// 		} else {
	// 			//
	// 			return {
	// 				outcome: 0
	// 			}
	// 			//
	// 		}
	// 	} catch (e) {
	// 		//
	// 		console.log(e.response.data.error)
	// 		//
	// 		return {
	// 			outcome: 0
	// 		}
	// 		//
	// 	}
	// 	//
	// },

	splitByAmount(data, amount) {
		//
		let finalResult = []
		let temp = []
		let counter = 0
		//
		for (let item of data) {
			temp.push(item)
			counter = counter + 1
			if (counter === amount) {
				finalResult.push(temp)
				temp = []
				counter = 0
			}
		}
		if (temp.length > 0) {
			finalResult.push(temp)
		}
		//
		//
		return finalResult
	}
}




// // API Key
// POST / _security / api_key
// {
// 	"name": "makcorp-data",
// 		"role_descriptors": {
// 		"role-a": {
// 			"cluster": ["all"],
// 				"index": [
// 					{
// 						"names": ["test*"],
// 						"privileges": ["all"]
// 					}
// 				]
// 		},
// 		"role-b": {
// 			"cluster": ["all"],
// 				"index": [
// 					{
// 						"names": ["capitalraises*"],
// 						"privileges": ["all"]
// 					}
// 				]
// 		},
// 		"role-c": {
// 			"cluster": ["all"],
// 				"index": [
// 					{
// 						"names": ["projects*"],
// 						"privileges": ["all"]
// 					}
// 				]
// 		},
// 		"role-d": {
// 			"cluster": ["all"],
// 				"index": [
// 					{
// 						"names": ["directors*"],
// 						"privileges": ["all"]
// 					}
// 				]
// 		},
// 		"role-e": {
// 			"cluster": ["all"],
// 				"index": [
// 					{
// 						"names": ["companies*"],
// 						"privileges": ["all"]
// 					}
// 				]
// 		},
// 		"role-f": {
// 			"cluster": ["all"],
// 				"index": [
// 					{
// 						"names": ["temptest*"],
// 						"privileges": ["all"]
// 					}
// 				]
// 		},
// 		"role-g": {
// 			"cluster": ["all"],
// 				"index": [
// 					{
// 						"names": ["financials*"],
// 						"privileges": ["all"]
// 					}
// 				]
// 		},
// 		"role-h": {
// 			"cluster": ["all"],
// 				"index": [
// 					{
// 						"names": ["shareholders*"],
// 						"privileges": ["all"]
// 					}
// 				]
// 		},
// 		"role-i": {
// 			"cluster": ["all"],
// 				"index": [
// 					{
// 						"names": ["marketdata*"],
// 						"privileges": ["all"]
// 					}
// 				]
// 		},
// 	}
// }
