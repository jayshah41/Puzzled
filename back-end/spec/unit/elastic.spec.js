const { ELASTICSERVICE } = require("../../models/elastic")

describe('Elastic functions', () => {

	// Every test can assume a connection
	beforeAll(async () => {
		//
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
		//
	})

	// it('should be able to create and delete an index', async () => {
	// 	//
	// 	const createIndexResult = await ELASTICSERVICE.createIndex("temptest")
	// 	//
	// 	expect(createIndexResult.outcome).toBe(1)
	// 	//
	// 	const deleteIndexResult = await ELASTICSERVICE.deleteIndex("temptest")
	// 	//
	// 	expect(deleteIndexResult.outcome).toBe(1)
	// 	//
	// })

	it('should be able to upload a document', async () => {
		//
		const uploadDocumentResult = await ELASTICSERVICE.uploadDocuments("test", [
			{
				"name": "test",
				"age": 10
			},
			{
				"name": "test2",
				"age": 102
			}
		])
		//
		expect(uploadDocumentResult.outcome).toBe(1)
		//
	})

	it('should be able to delete all documents from an index', async () => {
		//
		const uploadDocumentResult = await ELASTICSERVICE.uploadDocuments("test", [{
			"name": "test",
			"age": 10
		}])
		//
		expect(uploadDocumentResult.outcome).toBe(1)
		//
		const deleteDocumentsResult = await ELASTICSERVICE.deleteAllDocuments("test")
		//
		expect(deleteDocumentsResult.outcome).toBe(1)
		//
		const getDocumentsResult = await ELASTICSERVICE.getDocuments("test")
		//
		expect(getDocumentsResult.outcome).toBe(1)
		expect(getDocumentsResult.data.length).toBe(0)
		//
	})

	it('should be able to get documents', async () => {
		//
		// const deleteDocumentsResult = await ELASTICSERVICE.deleteAllDocuments("test")
		// //
		// expect(deleteDocumentsResult.outcome).toBe(1)
		//
		const uploadDocumentResult = await ELASTICSERVICE.uploadDocuments("test", [{
			"name": "test",
			"age": 10
		}])
		//
		expect(uploadDocumentResult.outcome).toBe(1)
		//
		const getDocumentsResult = await ELASTICSERVICE.getDocuments("test")
		//
		expect(getDocumentsResult.outcome).toBe(1)
		expect(getDocumentsResult.data.length).toBe(1)
		//
	})

	it('should be able to split large document sizes', async () => {
		//
		const arrayOfSomethings = [
			{
				something: 1
			},
			{
				something: 2
			},
			{
				something: 3
			},
			{
				something: 4
			},
		]
		expectedResult = [
			[
				{
					something: 1
				},
				{
					something: 2
				}
			], [
				{
					something: 3
				},
				{
					something: 4
				}
			]
		]
		//
		const result = await ELASTICSERVICE.splitByAmount(arrayOfSomethings, 2)
		expect(result).toEqual(expectedResult)
		//
	})

})
