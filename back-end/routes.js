
const { FTPSERVICE } = require("./models/ftp")
const { ELASTICSERVICE } = require("./models/elastic")
const { JWTSERVICE } = require("./models/jwt");
const { EMAILSERVICE } = require("./models/email")
const fs = require('fs');
const User = require("./models/user");
const Log = require("./models/log");
const DB = require("./models/db");
const Config = require("./config");
const JWT = require("./models/jwt");
const { DateTime } = require("luxon");
const base64 = require('base-64');
var session = require('express-session');
var config = require('./config');

// This is your real test secret API key.
let stripeKey;
if (Config.ENVIRONMENT.environment === "production") {
	console.log("PRODUCTION")
	stripeKey = Config.STRIPE.server.server_key_production
	// console.log({ stripeKey })
} else {
	console.log("DEVELOPMENT")
stripeKey = Config.STRIPE.server.server_key_development
// console.log({ stripeKey })
}
const stripe = require("stripe")(stripeKey);

const lowPriorityEmailList = [
	"varun5300@gmail.com",
	"eakhilsai1499@gmail.com",
	"shekharsuman0747@gmail.com",
	"info@makcorp.net.au"
]

const highPriorityEmailList = [
	"varun5300@gmail.com",
	"eakhilsai1499@gmail.com",
	"shekharsuman0747@gmail.com",
	"info@makcorp.net.au"
]

// CRDate

const csv = require('csvtojson');
const { nanoid } = require("nanoid");
const { kMaxLength } = require("buffer");
const Collection = require("mongodb/lib/collection");

exports.ROUTES = {

	async createPaymentIntent(req, res) {
		//
		// console.log("payment from UI",{ CreatePaymentBody: req.body },req.body.paymentId.length)
		//
		if (req.body.paymentId && req.body.paymentId.length > 0) {
			try {
				//
				const existingPaymentIntent = await stripe.paymentIntents.retrieve(req.body.paymentId)
				// console.log("existingPaymentIntent",{ existingPaymentIntent })
				const updateResult = await stripe.paymentIntents.update(
					req.body.paymentId,
					{
						statement_descriptor: "Makcorp License",
						amount: req.body.amount * 100,
						currency: "AUD",
						receipt_email: req.body.email,
						description: "Makcorp Licence: " + req.body.email
					}
				)
				//
				return res.status(200).send({
					clientSecret: updateResult.client_secret,
					paymentId: updateResult.id
				})
				//
			} catch (e) {
				//
				console.log("Invalid payment ID")
				//
			}
		}
		//
		const paymentIntent = await stripe.paymentIntents.create({
			statement_descriptor: "Makcorp License",
			amount: req.body.amount * 100,
			currency: "AUD",
			receipt_email: req.body.email,
			description: "Makcorp Licence: " + req.body.email
		})
		//
		console.log(paymentIntent.id)
		//
		return res.status(200).send({
			clientSecret: paymentIntent.client_secret,
			paymentId: paymentIntent.id
		})
		//
	},

	async convertData(req, res) {
		// Fire this off, then immediately return the response
		const type = req.header("Process")
		console.log({ ProcessType: type })
		this.convertDataProcess(type)
		//
		return res.status(200).send({})
		//
	},
	async convertDataProcess(type) {

		const capitalRaisesTitles = [
			"ASX",
			"CRDate",
			"CRAmount",
			"CRType",
			"CRLeadManager",
			"CRPrice",
			"AnnLink",
		]

		// const companiesTitles = [
		// 	"Priority Commodities",
		// 	"Location Projects Other",
		// 	"Project Locations",
		// 	"ASX Listing Date",
		// 	"ASX Code",
		// 	"LSE Code",
		// 	"TSX Code",
		// 	"Contact",
		// 	"Company",
		// 	"Quarterly Required",
		// 	"QT Project Spend",
		// 	"QT Staff and Admin Costs",
		// 	"ERP",
		// 	"Industry",
		// 	"2017 Start Price",
		// 	"2018 Start Price",
		// 	"2019 Start Price",
		// 	"2020 Start Price",
		// 	"2021 Start Price",
		// 	"ASX Share Price",
		// 	"Commodities Minerals",
		// 	"Share Market Cap",
		// 	"Phone",
		// 	"Directors Shares",
		// 	"Date Annual Report",
		// 	"Date Contacts",
		// 	"Date Half Yearly",
		// 	"Date Quarterly Cashflow",
		// 	"Date Top 20",
		// 	"Annual Salaries",
		// 	"ASX High Price",
		// 	"ASX Low Price",
		// 	"Avge Daily",
		// ]

		const companies2Titles = [
			"Priority Commodities",
			"Location Projects Other",
			"Project Locations",
			"ASX Listing Date",
			"ASX Code",
			"LSE Code",
			"TSX Code",
			"Contact",
			"Company",
			"Quarterly Required",
			"QT Project Spend",
			"QT Staff and Admin Costs",
			"ERP",
			"Industry",
			"2017 Start Price",
			"2018 Start Price",
			"2019 Start Price",
			"2020 Start Price",
			"2021 Start Price",
			"ASX Share Price",
			"Commodities Minerals",
			"Share Market Cap",
			"Phone",
			"Directors Shares",
			"Date Annual Report",
			"Date Contacts",
			"Date Half Yearly",
			"Date Quarterly Cashflow",
			"Date Top 20",
			"Annual Salaries",
			"ASX High Price",
			"ASX Low Price",
			"Avge Daily SP 10 Days",
			"Avge Daily SP 2 Days",
			"Avge Daily Vol 10 Days",
			"Avge Daily Vol 2 Days",
			"City",
			"Considation Split",
			"Consolidated Split X To 1",
			"Corporate Services",
			"Country",
			"Ext Auditor",
			"Audit & Non Audit Services",
			"Investor Relations and Corporate Advisor",
			"Last Date Directors Share Purchase",
			"LSE Listing Date",
			"LSE Xchange",
			"Old Company Names & ASX Codes",
			"Postcode",
			"QT Expl Spend",
			"QT Income",
			"QT Prod Spend",
			"QT Staff Costs",
			"Share Volumes",
			"State",
			"Title",
			"Total Shares",
			"TSX",
			"Web Site",
		]

		const projectsTitles = [
			"ASX Codes",
			"TSX Codes",
			"Companies",
			"Contact",
			"Title",
			"Phone",
			"MarketCap",
			"Enterprise Market Value",
			"TotalShares",
			"Admin Costs",
			"Income",
			"Project Spend",
			"Staff Costs",
			"Staff & Admin Costs",
			"Priority Commodities",
			"Search Field",
			"Project Name & Commodities",
			"Project Stage",
			"Est Mine Life",
			"Project Location",
			"Joint Venture Info",
			"Cost per tonne",
			"Sale Price per tonne",
			"Net Project Value",
			"Open Pit",
			"Underground",
			"Project Web Page",
			"Resource Units",
			"Resource Indicated",
			"Resource Inferred",
			"Resource Measured",
			"Resource Actual Amount",
			"Resource Actual Percent",
			"Mining Licence Approved",
			"Environmental Approval",
			"Project Announcement",
			"Project Start Date",
			"Quarterly Announcement",
			"Capital Raise Date",
			"Capital Raise Amount",
			"Updated By",
			"Capital Raise Announcement",
			"Notes",
			"Commodity Type",
			"Commodity Mine Type",
			"Commodity Units",
			"Commodity Indicated",
			"Commodity Inferred",
			"Commodity Measured",
			"Commodity Proven Total",
			"Commodity Probable Total",
			"Commodity Proven Contained",
			"Commodity Probable Contained",
			"Commodity Proven Grade",
			"Commodity Probable Grade",
			"Commodity Total Resource",
			"Commodity Actual Amount",
			"Commodity Actual Percent",
			"Commodity Grade Units",
			"Commodity Grade Indicated",
			"Commodity Grade Inferred",
			"Commodity Grade Measured",
			"Commodity Grade Actual Value",
			"Commodity Grade Actual Percent of Target",
			"Commodity Cut Off",
			"Commodity Production Cost per Unit",
			"Commodity Production Qty",
			"Commodity Production Unit",
			"Commodity Production Frequency",
			"Commodity Production YTD",
			"Commodity Production Currency",
			"Commodity Production Grade",
			"Commodity Strip Ratio",
			"Processed Tonnes",
			"Processed Grade",
			"Processed Recovery",
			"Processed Commodity Produced",
			"Processed Commodity Sold",
			"Proven Probable Total",
			"Total Ore Mined",
			"Total Mined Grade",
			"Cost Site Admin per unit",
			"Cost Stockpile per unit",
			"Cost Mining per unit",
			"Cost Processing per unit",
			"Cost Royalties Refining Other per unit",
			"Cost Total per unit",
			"Commodity Notes",
			"ProjectID",
			"CommodityID",
			"Drilling Periods",
			"Project Area Other Companies", //Project Industry
			"Project Location Belt",
			"Project Location Area",
			"Project Location City",
			"Project Location State",
			"Project Location Country",
			"Project Location Continent",
			"Drill Grade Low",
			"Drill Grade High",
			"Drill Width Low",
			"Drill Width High",
			"Drill Depth Low",
			"Drill Depth High",
			"Drill Length Low",
			"Drill Length High",
			"Drill Ann Date",
			"Drill Ann Link",
			"Project Updated",
		]

		const directorsTitles = [
			"Other Directorships and History",
			"Contact",
			"Title",
			"Qualifications/Experience",
			"Company",
			"ASXCode",
			"Shares Held",
			"Percent Held",
			"Total Shares",
			"Market Cap Now",
			"Base Remuneration",
			"Total Remuneration",
			"Commencement Date",
			"Resignation Date",
			"Project Stage",
			"Commodities",
			"Directors Shares",
			"Ext Auditor",
			"Priority Commodities",
			"Location Projects Other",
			"CONTACTID",
			"LinkedIn",
			"Start Project Stage",
			"End Project Stage",
			"Ann Date",
			"Ann Link",
			"Ann Type",
			"Share Options",
			"Performance Shares",
			"Cash Bonus",
		]

		const financialsTitles = [
			"Period",
			"ASX",
			"AnnDate",
			"NetOperatingCashFlow",
			"CustomerIncome",
			"OtherIncome",
			"ExplSpend",
			"DevProdSpend",
			"StaffCosts",
			"AdminCosts",
			"OtherCosts",
			"NetCashInvest",
			"CashflowNegative",
			"CashflowPositive",
			"CashflowTotal",
			"CashflowFin31",
			"CashflowFin35_39",
			"BankBalance",
			"Debt",
			"ForecastNetOperating",
			"ForecastIncome",
			"ForecastExplSpend",
			"ForecastDevProdSpend",
			"ForecastStaffCost",
			"ForecastAdminCost",
			"AnnWebLink",
		]

		const financialsHATitles = [
			"Period",
			"ASX",
			"AnnDate",
			"AnnWebLink",
			"Salaries",
			"EmployeeBenefits",
			"ConsultingFees",
			"Exploration",
			"Production",
			"AllOtherCosts",
			"Income",
			"ProfitandLoss",
			"EarnperShare",
			"Assets",
			"Liabilities",
			"Equity",
		]

		const shareholdersTitles = [
			"Entity",
			"Contact",
			"JobTitle",
			"YearsHeld",
			"AnnType",
			"CurrentSharesHeld",
			"PreviousSharesHeld",
			"CurrentSharePercent",
			"PreviousSharePercent",
			"SharePercentChange",
			"Company",
			"ASXCode",
			"LastClosePrice",
			"TotalShares",
			"MarketCap",
			"Commodities",
			"PriorityCommodities",
			"AnnDate",
			"EntitySubName"
		]

		const marketdataTitles = [
			"Changed",
			"ASX",
			"NewVolume",
			"PrevVolume",
			"PrevPrevVolume",
			"NewPrice",
			"PrevPrice",
			"PrevPrevPrice",
			"MarketCap",
		]

		let jobList = [

			{
				foreignPath: "/CapitalRaises",
				headers: capitalRaisesTitles,
				indexes: [
					"capitalraises",
					"capitalraises_tier1",
					"capitalraises_tier2",
					"asx_capitalraises",
					"asx_capitalraises_tier1",
					"asx_capitalraises_tier2"
				]
			},

			{
				foreignPath: "/Companies",
				headers: companies2Titles,
				indexes: [
					"asx_companies_ver2",
				]
			},

			{
				foreignPath: "/Projects",
				headers: projectsTitles,
				indexes: [
					"projects",
					"projects_tier1",
					"projects_tier2",
					"asx_projects",
					"asx_projects_tier1",
					"asx_projects_tier2",
				]
			},

			{
				foreignPath: "/Directors",
				headers: directorsTitles,
				indexes: [
					"asx_directors_tier1",
					"asx_directors_tier2",
				]
			},

			{
				foreignPath: "/Financials",
				headers: financialsTitles,
				indexes: [
					"asx_financials_tier1",
					"asx_financials_tier2",
				]
			},

			{
				foreignPath: "/FinancialsHalfAnnual",
				headers: financialsHATitles,
				indexes: [
					"asx_financials_ha_tier1",
					"asx_financials_ha_tier2",
				]
			},

			{
				foreignPath: "/Shareholders",
				headers: shareholdersTitles,
				indexes: [
					"asx_shareholders_tier1",
					"asx_shareholders_tier2",
				]
			},

			{
				foreignPath: "/MarketData",
				headers: marketdataTitles,
				indexes: [
					"marketdata_public",
					"asx_marketdata_tier1",
					"asx_marketdata_tier2",
				]
			},

		]

		try {
			await EMAILSERVICE.sendEmail(
				"info@makcorp.net.au",
				lowPriorityEmailList.join(","),
				`Makcorp - Data Load - Starting Data Load (${type})`,
				`<p>Starting the dataload for ${type}</p>`,
				`Starting the dataload for ${type}`
			)
		} catch (e) {
			console.log(e)
		}

		const ftpClientResult = await FTPSERVICE.connect()
		if (ftpClientResult.outcome === 0) {
			console.log("Could not connect to FTP")
			await EMAILSERVICE.sendEmail(
				"info@makcorp.net.au",
				lowPriorityEmailList.join(","),
				`Makcorp - Data Load - Could not connect to FTP`,
				`<p>Could not connect to FTP</p>`,
				`Could not connect to FTP`
			)
			return
		}
		const ftpClient = ftpClientResult.client

		for (let job of jobList) {
			//
			if (job.foreignPath !== type && type !== "all") {
				// Only run the jobs for the type being called
				continue
			}
			//
			const ftpListResult = await FTPSERVICE.list(ftpClient, job.foreignPath)
			//
			if (ftpListResult.outcome === 0) {
				//
				await EMAILSERVICE.sendEmail(
					"info@makcorp.net.au",
					lowPriorityEmailList.join(","),
					`Makcorp - Data Load - Could not list a directory in FTP`,
					`<p>Could not list a directory in FTP: ${job.foreignPath}</p>`,
					`Could not list a directory in FTP: ${job.foreignPath}`
				)
				//
				continue //res.status(500).send()
				//
			}
			//
			const filename = ftpListResult.list[ftpListResult.list.length - 1].name
			const localFilename = "/tmp/" + filename
			const foreignFilename = job.foreignPath + "/" + filename
			//
			const downloadResult = await FTPSERVICE.download(ftpClient, localFilename, foreignFilename)
			//
			if (downloadResult.outcome === 0) {
				//
				console.log("ERROR: Could not download the file:" + foreignFilename)
				//
				await EMAILSERVICE.sendEmail(
					"info@makcorp.net.au",
					lowPriorityEmailList.join(","),
					`Makcorp - Data Load - Could not download a file`,
					`<p>Could not download a file: ${foreignFilename}</p>`,
					`Could not download a file: ${foreignFilename}`
				)
				//
				return {
					outcome: 0
				}
				//
			}
			//
			console.log("Got the " + filename + " file from FTP.")
			//
			jobList = jobList.map(j => {
				if (j.foreignPath === job.foreignPath) {
					j.filename = filename
					j.localFilename = localFilename
					j.foreignFilename = foreignFilename
				}
				return j
			})
		}
		ftpClient.close()
		console.log("Closed the client")

		for (let job of jobList) {
			//
			if (job.foreignPath !== type && type !== "all") {
				// Only run the jobs for the type being called
				continue
			}
			// await Promise.all(job.indexes.map(async (indexName) => {
			const fileData = fs.readFileSync(job.localFilename)
			for (let indexName of job.indexes) {
				await this.processCSVFile(job.filename, fileData, indexName, job.headers)
			}
			// }))
			console.log(job.foreignPath + " is complete.")
		}
		// for (let indexName of job.indexes) {
		// 	//
		// 	this.processCSVFile(filename, fileData, indexName, job.headers)
		// 	//
		// }
		//
		// }

		// await this.processType("/CapitalRaises", "capitalraises", capitalRaisesTitles)
		// await this.processType("/CapitalRaises", "capitalraises_tier1", capitalRaisesTitles)
		// await this.processType("/CapitalRaises", "capitalraises_tier2", capitalRaisesTitles)
		// await this.processType("/CapitalRaises", "asx_capitalraises", capitalRaisesTitles)
		// await this.processType("/CapitalRaises", "asx_capitalraises_tier1", capitalRaisesTitles)
		// await this.processType("/CapitalRaises", "asx_capitalraises_tier2", capitalRaisesTitles)

		// // await this.processType("/Companies", "companies", companiesTitles)
		// // await this.processType("/Companies", "asx_companies", companiesTitles)
		// await this.processType("/Companies", "companies_ver2", companies2Titles)
		// await this.processType("/Companies", "asx_companies_ver2", companies2Titles)

		// await this.processType("/Projects", "projects", projectsTitles)
		// await this.processType("/Projects", "projects_tier1", projectsTitles)
		// await this.processType("/Projects", "projects_tier2", projectsTitles)
		// await this.processType("/Projects", "asx_projects", projectsTitles)
		// await this.processType("/Projects", "asx_projects_tier1", projectsTitles)
		// await this.processType("/Projects", "asx_projects_tier2", projectsTitles)

		// await this.processType("/Directors", "directors", directorsTitles)
		// await this.processType("/Directors", "directors_tier1", directorsTitles)
		// await this.processType("/Directors", "directors_tier2", directorsTitles)
		// await this.processType("/Directors", "asx_directors", directorsTitles)
		// await this.processType("/Directors", "asx_directors_tier1", directorsTitles)
		// await this.processType("/Directors", "asx_directors_tier2", directorsTitles)

		// await this.processType("/Financials", "financials", financialsTitles)
		// await this.processType("/Financials", "financials_tier1", financialsTitles)
		// await this.processType("/Financials", "financials_tier2", financialsTitles)
		// await this.processType("/Financials", "asx_financials", financialsTitles)
		// await this.processType("/Financials", "asx_financials_tier1", financialsTitles)
		// await this.processType("/Financials", "asx_financials_tier2", financialsTitles)

		// await this.processType("/FinancialsHalfAnnual", "financials_ha", financialsHATitles)
		// await this.processType("/FinancialsHalfAnnual", "financials_ha_tier1", financialsHATitles)
		// await this.processType("/FinancialsHalfAnnual", "financials_ha_tier2", financialsHATitles)
		// await this.processType("/FinancialsHalfAnnual", "asx_financials_ha", financialsHATitles)
		// await this.processType("/FinancialsHalfAnnual", "asx_financials_ha_tier1", financialsHATitles)
		// await this.processType("/FinancialsHalfAnnual", "asx_financials_ha_tier2", financialsHATitles)

		// await this.processType("/Shareholders", "shareholders", shareholdersTitles)
		// await this.processType("/Shareholders", "shareholders_tier1", shareholdersTitles)
		// await this.processType("/Shareholders", "shareholders_tier2", shareholdersTitles)
		// await this.processType("/Shareholders", "asx_shareholders", shareholdersTitles)
		// await this.processType("/Shareholders", "asx_shareholders_tier1", shareholdersTitles)
		// await this.processType("/Shareholders", "asx_shareholders_tier2", shareholdersTitles)

		// await this.processType("/MarketData", "marketdata_public", marketdataTitles)
		// await this.processType("/MarketData", "marketdata_public_tier1", marketdataTitles)
		// await this.processType("/MarketData", "marketdata_public_tier2", marketdataTitles)
		// await this.processType("/MarketData", "marketdata", marketdataTitles)
		// await this.processType("/MarketData", "marketdata_tier1", marketdataTitles)
		// await this.processType("/MarketData", "marketdata_tier2", marketdataTitles)
		// await this.processType("/MarketData", "asx_marketdata", marketdataTitles)
		// await this.processType("/MarketData", "asx_marketdata_tier1", marketdataTitles)
		// await this.processType("/MarketData", "asx_marketdata_tier2", marketdataTitles)

		console.log("Load Complete")
		//
		await EMAILSERVICE.sendEmail(
			"info@makcorp.net.au",
			highPriorityEmailList.join(","),
			`Makcorp - Data Load - Complete for ${type}`,
			`<p>Complete for ${type}</p>`,
			`Complete for ${type}`
		)
		//
		// return res.status(200).send({})
		//
	},

	// async processType(foreignPath, indexName, headers) {
	// 	//
	// 	console.log({ indexName })
	// 	//
	// 	const ftpListResult = await FTPSERVICE.list(foreignPath)
	// 	//
	// 	if (ftpListResult.outcome === 0) {
	// 		//
	// 		return //res.status(500).send()
	// 		//
	// 	}
	// 	//
	// 	// for (let item of ftpListResult.list) {
	// 	//
	// 	// const processResult = await this.processCSVFile(ftpListResult.list[ftpListResult.list.length - 1].name, foreignPath + "/", indexName, headers)
	// 	await this.processCSVFile(ftpListResult.list[ftpListResult.list.length - 1].name, foreignPath + "/", indexName, headers)
	// 	//
	// 	// }
	// 	//
	// },

	async checkHeaders(fileData, indexName, headers, filename) {
		// console.log({ data: fileData.toString() })
		//
		const expectedHeaderText = headers.join("|")
		const incomingHeadertext = fileData.toString().split('\r\n')[0]
		const result = expectedHeaderText === incomingHeadertext
		//
		if (result === false) {
			await EMAILSERVICE.sendEmail(
				"info@makcorp.net.au",
				highPriorityEmailList.join(","),
				`Makcorp - Data Load - Change to CSV Data Format - ${indexName}`,
				`
<p>File: ${filename}</p>
<p>Expected Headers: ${expectedHeaderText}</p>
<p>Incoming Headers: ${incomingHeadertext}</p>
				`,
				`File: ${filename}. Expected Headers: ${expectedHeaderText}. Incoming Headers: ${incomingHeadertext}`
			)
		}
		//
		return result
		//
	},

	async processCSVFile(filename, fileData, indexName, headers) {
		//
		// const fullFilename = "/tmp/" + filename
		//
		// console.log({ fullFilename })
		// console.log({ filename })
		//
		// const downloadResult = await FTPSERVICE.download(fullFilename, foreignPath + filename)
		// //
		// if (downloadResult.outcome === 0) {
		// 	//
		// 	return {
		// 		outcome: 0
		// 	}
		// 	//
		// }
		// //
		// const fileData = fs.readFileSync(fullFilename)
		//
		const headers_result = await this.checkHeaders(fileData, indexName, headers, filename)
		if (headers_result === false) {
			return {
				outcome: 0
			}
		}
		//
		let jsonData;
		jsonData = await csv({
			noheader: false,
			delimiter: "|",
			checkType: true,
			ignoreEmpty: true,
			headers: headers
		})
			.fromString(fileData.toString())
			.then(json => json)
		//
		// if (indexName.includes("tier1")) {
		// 	//
		// 	// Top 50 and Bottom 50 of each 
		// 	//
		// 	const amountToGet = 50
		// 	jsonData = jsonData.slice(0, amountToGet).concat(jsonData.slice(jsonData.length - amountToGet, jsonData.length))
		// 	//
		// }
		// if (indexName.includes("directors")) {
		// 	jsonData = jsonData.map(item => {
		// 		//
		// 		if (item["Total Remuneration"]) {
		// 			item["Total Remuneration"] = parseFloat(item["Total Remuneration"])
		// 		}
		// 		//
		// 		return item
		// 		//
		// 	})
		// }
		//
		if (indexName === "asx_companies_ver2") {
			jsonData = jsonData.map(item => {
				//
				item["2017 Start Price V2"] = item["2017 Start Price"]
				item["2018 Start Price V2"] = item["2018 Start Price"]
				item["2019 Start Price V2"] = item["2019 Start Price"]
				item["2020 Start Price V2"] = item["2020 Start Price"]
				item["2021 Start Price V2"] = item["2021 Start Price"]
				//
				item["2017 Start Price"] = 0
				item["2018 Start Price"] = 0
				item["2019 Start Price"] = 0
				item["2020 Start Price"] = 0
				item["2021 Start Price"] = 0
				//
				return item
				//
			})
		}
		//
		if (indexName.includes("financials")) {
			jsonData = jsonData.map(item => {
				//
				item["ProjectSpending"] = item["DevProdSpend"] + item["ExplSpend"]
				item["StaffAdminSpending"] = item["StaffCosts"] + item["AdminCosts"]
				item["TOTALCOSTS"] = item["DevProdSpend"] + item["ExplSpend"] + item["StaffCosts"] + item["AdminCosts"] + item["OtherCosts"]
				//
				return item
			})
		}
		//
		if (indexName.includes("marketdata") && indexName.includes("tier1")) {
			jsonData = jsonData.filter(item => {
				return DateTime.fromFormat(item["Changed"], "yyyy-MM-dd") >= DateTime.now().minus({ years: 1 })
			})
		}
		//
		if (indexName.includes("financials_tier1") || indexName.includes("financials_ha_tier1")) {
			const periodList = jsonData.map(item => {
				return item["Period"]
			})
			let uniquePeriodList = [...new Set(periodList)];
			uniquePeriodList.sort()
			uniquePeriodList = uniquePeriodList.slice(Math.max(uniquePeriodList.length - 4, 0))
			jsonData = jsonData.filter(item => {
				let match = false
				for (let period of uniquePeriodList) {
					if (item["Period"] === period) {
						match = true
					}
				}
				return match
			})
		}
		//
		if (indexName === "asx_marketdata" || indexName.includes("asx_")) {
			jsonData = jsonData.map(item => {
				if (item["ASX"]) {
					item["ASXCode"] = item["ASX"]
					delete item["ASX"]
				}
				if (item["ASX Code"]) {
					item["ASXCode"] = item["ASX Code"]
					delete item["ASX Code"]
				}
				if (item["ASX Codes"]) {
					item["ASXCode"] = item["ASX Codes"]
					delete item["ASX Codes"]
				}
				return item
			})
		}
		//
		if (
			indexName === "marketdata_public"
			|| indexName === "marketdata_public_tier1"
			|| indexName === "marketdata_public_tier2"
		) {
			jsonData = jsonData.filter(item => {
				if (
					item.ASX === "IXR"
					|| item.ASX === "BSX"
					|| item.ASX === "GLN"
					|| item.ASX === "ADT"
					|| item.ASX === "IMA"
				) {
					return true
				} else {
					return false
				}
			})
		}
		//
		if (
			indexName === "capitalraises"
			|| indexName === "capitalraises_tier1"
			|| indexName === "capitalraises_tier2"
			|| indexName === "asx_capitalraises"
			|| indexName === "asx_capitalraises_tier1"
			|| indexName === "asx_capitalraises_tier2"
		) {
			jsonData = jsonData.filter(item => {
				if (
					item.ASX === "EQR"
					|| item.ASXCode === "EQR"
				) {
					return false
				} else {
					if (typeof item.CRAmount === "number") {
						return true
					} else {
						return false
					}
				}
			})
		}
		if (
			indexName === "projects"
			|| indexName === "projects_tier1"
			|| indexName === "projects_tier2"
		) {
			//
			jsonData = jsonData.filter(item => {
				// console.log({ item })
				// console.log(item["ASX Codes"])
				return (item["ASX Codes"] && item["ASX Codes"].length > 0)
			})
			//
			jsonData = jsonData.map(item => {
				//
				// console.log({ item })
				// console.log(item["ASX Codes"])
				delete item["TSX Codes"]
				//
				return item
				//
			})
		}
		//
		if (
			indexName === "asx_projects"
			|| indexName === "asx_projects_tier1"
			|| indexName === "asx_projects_tier2"
		) {
			//
			jsonData = jsonData.filter(item => {
				// console.log({ item })
				// console.log(item["ASX Codes"])
				return (item["ASXCode"] && item["ASXCode"].length > 0)
			})
			//
			jsonData = jsonData.map(item => {
				//
				// console.log({ item })
				// console.log(item["ASX Codes"])
				delete item["TSX Codes"]
				//
				return item
				//
			})
			//
		}
		//
		if (
			indexName.includes("financials")
		) {
			jsonData = jsonData.map(item => {
				item["VALUE"] = item["StaffCosts"] + item["AdminCosts"]
				return item
			})
		}
		if (
			indexName === "shareholders"
			|| indexName === "shareholders_tier1"
			|| indexName === "shareholders_tier2"
			|| indexName === "asx_shareholders"
			|| indexName === "asx_shareholders_tier1"
			|| indexName === "asx_shareholders_tier2"
		) {
			//
			jsonData = jsonData.map(item => {
				//
				// delete item["AnnDate"]
				//
				item["VALUE"] = item["CurrentSharesHeld"] * item["LastClosePrice"]
				//
				return item
				//
			})
			//
			jsonData = jsonData.filter(item => {
				//
				return item["Entity"] && item["Entity"].indexOf("Top20") === -1
					&& item["Entity"].indexOf("Top 20") === -1
				//
			})
		}
		//
		if (indexName.includes("_tier1") || indexName.includes("_tier2")) {
			jsonData = jsonData.map(item => {
				//
				if (
					indexName === "capitalraises_tier1"
					|| indexName === "capitalraises_tier2"
				) {
					// Tier 1	Contact
					// Tier 1	Company
					// Tier 1	ASX
					// Tier 1	CR Date
					// Tier 1	CR Amount
					// Tier 1	CR Type
					// Tier 2	CR Lead Manager
					// Tier 2	CR Price
					// Tier 2	CR Ann Link
					//
					if (indexName === "capitalraises_tier1") {
						delete item["CRLeadManager"]
						delete item["CRPrice"]
						delete item["AnnLink"]
					}
					//
				}
				//
				if (
					indexName === "asx_capitalraises_tier1"
					|| indexName === "asx_capitalraises_tier2"
				) {
					// Tier 1	Contact
					// Tier 1	Company
					// Tier 1	ASX
					// Tier 1	CR Date
					// Tier 1	CR Amount
					// Tier 1	CR Type
					// Tier 2	CR Lead Manager
					// Tier 2	CR Price
					// Tier 2	CR Ann Link
					//
					if (indexName === "asx_capitalraises_tier1") {
						delete item["CRLeadManager"]
						delete item["CRPrice"]
						delete item["AnnLink"]
					}
					//
				}
				//
				// if (
				// 	indexName === "companies_tier1"
				// 	|| indexName === "companies_tier2"
				// ) {
				// 
				// }
				// //
				// if (
				// 	indexName === "asx_companies_tier1"
				// 	|| indexName === "asx_companies_tier2"
				// ) {
				// 
				// }
				//
				if (
					indexName === "projects_tier1"
					|| indexName === "projects_tier2"
				) {
					// Tier 1	ASX Codes
					// Tier 1	TSX Codes
					// Tier 1	Project Name
					// Tier 1	Commodity Type
					// Tier 1	Priority Commodities
					// Tier 1	Project Stage
					// Est Mine Life
					// Tier 1	Project Location
					// Project Location Belt
					// Tier 2	Project Location Area
					// Tier 2	Project Location City
					// Tier 1	Project Location State
					// Tier 1	Project Location Country
					// Tier 1	Project Location Continent
					// Tier 2	Drill Ann Date
					// Tier 2	Drilling Periods
					// Tier 2	Drill Grade Low
					// Tier 2	Drill Grade High
					// Tier 2	Drill Width Low
					// Tier 2	Drill Width High
					// Tier 2	Drill Depth Low
					// Tier 2	Drill Depth High
					// Tier 2	Drill Length Low
					// Tier 2	Drill Length High
					// Tier 2	Drill Ann Link
					// Tier1	Joint Venture Info
					// Tier 2	Cost per tonne
					// Tier 2	Sale Price per tonne
					// Tier 2	Net Project Value
					// Tier 2	Open Pit
					// Tier 2	Underground
					// Tier 2	Project Web Page
					// Tier 2	Resource Units
					// Tier 2	 Resource Indicated
					// Tier 2	 Resource Inferred
					// Tier 2	 Resource Measured
					// Tier 2	 Resource Actual Amount
					// Tier 2	Resource Actual Percent
					// Tier 2	Mining Licence Approved
					// Tier 2	Environmental Approval
					// Tier 2	Project Announcement
					// Tier 2	Notes
					// Tier 2	Project Start Date
					// Tier 2	Quarterly Announcement
					// Tier 2	Commodity Mine Type
					// Tier 2	Commodity Units
					// Tier 2	Commodity Grade Units
					// Tier 2	Enter Current Price
					// Tier 2	Commodity Indicated
					// Tier 2	Calculated Indicated Value
					// Tier 2	Commodity Grade Indicated
					// Tier 2	Commodity Inferred
					// Tier 2	Calculated Inferred Value
					// Tier 2	Commodity Grade Inferred
					// Tier 2	Commodity Measured
					// Tier 2	Calculated Measured Value
					// Tier 2	Commodity Grade Measured
					// Tier 2	Commodity Total Resource
					// Tier 2	Calculated Total Resource Value
					// Tier 2	Commodity Proven Contained
					// Tier 2	Calculated Proven Contained Value
					// Tier 2	Commodity Proven Grade
					// Tier 2	Commodity Probable Contained
					// Tier 2	Calculated Probable Contained Value
					// Tier 2	Commodity Probable Grade
					// Tier 2	Commodity Proven Total
					// Tier 2	Calculated Proven Total Value
					// Tier 2	Commodity Probable Total
					// Tier 2	Calculated Probable Total Value
					// Tier 2	Proven Probable Total
					// Tier 2	Calculated Proven Probable Value
					// Tier 3	 Commodity Actual Amount
					// Tier 3	Commodity Actual Percent
					// Tier 3	Commodity Grade Actual Value
					// Tier 3	Commodity Grade Actual Percent of Target
					// Tier 3	Commodity Cut Off
					// Tier 3	Commodity Production Cost per Unit
					// Tier 3	Commodity Production Qty
					// Tier 3	Commodity Production Unit
					// Tier 3	Commodity Production Frequency
					// Tier 3	Commodity Production YTD
					// Tier 3	Commodity Production Currency
					// Tier 3	Commodity Production Grade
					// Tier 3	Commodity Strip Ratio
					// Tier 3	Processed Tonnes
					// Tier 3	Processed Grade
					// Tier 3	Processed Recovery
					// Tier 3	Processed Commodity Produced
					// Tier 3	Processed Commodity Sold
					// Tier 3	Total Ore Mined
					// Tier 3	Total Mined Grade
					// Tier 3	Cost Site Admin per unit
					// Tier 3	Cost Stockpile per unit
					// Tier 3	Cost Mining per unit
					// Tier 3	Cost Processing per unit
					// Tier 3	Cost Royalties Refining Other per unit
					// Tier 3	Cost Total per unit
					// Tier 3	Commodity Notes
					// Tier 2	Project Area Other Companies
					//
					if (indexName === "projects_tier1") {
						//
						delete item["Project Location Area"]
						delete item["Project Location City"]
						delete item["Drill Ann Date"]
						delete item["Drilling Periods"]
						delete item["Drill Grade Low"]
						delete item["Drill Grade High"]
						delete item["Drill Width Low"]
						delete item["Drill Width High"]
						delete item["Drill Depth Low"]
						delete item["Drill Depth High"]
						delete item["Drill Length Low"]
						delete item["Drill Length High"]
						delete item["Drill Ann Link"]
						delete item["Cost per tonne"]
						delete item["Sale Price per tonne"]
						delete item["Net Project Value"]
						delete item["Open Pit"]
						delete item["Underground"]
						delete item["Project Web Page"]
						delete item["Resource Units"]
						delete item["Resource Indicated"]
						delete item["Resource Inferred"]
						delete item["Resource Measured"]
						delete item["Resource Actual Amount"]
						delete item["Resource Actual Percent"]
						delete item["Mining Licence Approved"]
						delete item["Environmental Approval"]
						delete item["Project Announcement"]
						delete item["Notes"]
						delete item["Project Start Date"]
						delete item["Quarterly Announcement"]
						delete item["Commodity Mine Type"]
						delete item["Commodity Units"]
						delete item["Commodity Grade Units"]
						delete item["Enter Current Price"]
						delete item["Commodity Indicated"]
						delete item["Calculated Indicated Value"]
						delete item["Commodity Grade Indicated"]
						delete item["Commodity Inferred"]
						delete item["Calculated Inferred Value"]
						delete item["Commodity Grade Inferred"]
						delete item["Commodity Measured"]
						delete item["Calculated Measured Value"]
						delete item["Commodity Grade Measured"]
						delete item["Commodity Total Resource"]
						delete item["Calculated Total Resource Value"]
						delete item["Commodity Proven Contained"]
						delete item["Calculated Proven Contained Value"]
						delete item["Commodity Proven Grade"]
						delete item["Commodity Probable Contained"]
						delete item["Calculated Probable Contained Value"]
						delete item["Commodity Probable Grade"]
						delete item["Commodity Proven Total"]
						delete item["Calculated Proven Total Value"]
						delete item["Commodity Probable Total"]
						delete item["Calculated Probable Total Value"]
						delete item["Proven Probable Total"]
						delete item["Calculated Proven Probable Value"]
						delete item["Commodity Actual Amount"]
						delete item["Commodity Actual Percent"]
						delete item["Commodity Grade Actual Value"]
						delete item["Commodity Grade Actual Percent of Target"]
						delete item["Commodity Cut Off"]
						delete item["Commodity Production Cost per Unit"]
						delete item["Commodity Production Qty"]
						delete item["Commodity Production Unit"]
						delete item["Commodity Production Frequency"]
						delete item["Commodity Production YTD"]
						delete item["Commodity Production Currency"]
						delete item["Commodity Production Grade"]
						delete item["Commodity Strip Ratio"]
						delete item["Processed Tonnes"]
						delete item["Processed Grade"]
						delete item["Processed Recovery"]
						delete item["Processed Commodity Produced"]
						delete item["Processed Commodity Sold"]
						delete item["Total Ore Mined"]
						delete item["Total Mined Grade"]
						delete item["Cost Site Admin per unit"]
						delete item["Cost Stockpile per unit"]
						delete item["Cost Mining per unit"]
						delete item["Cost Processing per unit"]
						delete item["Cost Royalties Refining Other per unit"]
						delete item["Cost Total per unit"]
						delete item["Commodity Notes"]
						delete item["Project Area Other Companies"]
						//
					}
					//
				}
				//
				if (
					indexName === "asx_projects_tier1"
					|| indexName === "asx_projects_tier2"
				) {
					if (indexName === "asx_projects_tier1") {
						//
						delete item["Project Location Area"]
						delete item["Project Location City"]
						delete item["Drill Ann Date"]
						delete item["Drilling Periods"]
						delete item["Drill Grade Low"]
						delete item["Drill Grade High"]
						delete item["Drill Width Low"]
						delete item["Drill Width High"]
						delete item["Drill Depth Low"]
						delete item["Drill Depth High"]
						delete item["Drill Length Low"]
						delete item["Drill Length High"]
						delete item["Drill Ann Link"]
						delete item["Cost per tonne"]
						delete item["Sale Price per tonne"]
						delete item["Net Project Value"]
						delete item["Open Pit"]
						delete item["Underground"]
						delete item["Project Web Page"]
						delete item["Resource Units"]
						delete item["Resource Indicated"]
						delete item["Resource Inferred"]
						delete item["Resource Measured"]
						delete item["Resource Actual Amount"]
						delete item["Resource Actual Percent"]
						delete item["Mining Licence Approved"]
						delete item["Environmental Approval"]
						delete item["Project Announcement"]
						delete item["Notes"]
						delete item["Project Start Date"]
						delete item["Quarterly Announcement"]
						delete item["Commodity Mine Type"]
						delete item["Commodity Units"]
						delete item["Commodity Grade Units"]
						delete item["Enter Current Price"]
						delete item["Commodity Indicated"]
						delete item["Calculated Indicated Value"]
						delete item["Commodity Grade Indicated"]
						delete item["Commodity Inferred"]
						delete item["Calculated Inferred Value"]
						delete item["Commodity Grade Inferred"]
						delete item["Commodity Measured"]
						delete item["Calculated Measured Value"]
						delete item["Commodity Grade Measured"]
						delete item["Commodity Total Resource"]
						delete item["Calculated Total Resource Value"]
						delete item["Commodity Proven Contained"]
						delete item["Calculated Proven Contained Value"]
						delete item["Commodity Proven Grade"]
						delete item["Commodity Probable Contained"]
						delete item["Calculated Probable Contained Value"]
						delete item["Commodity Probable Grade"]
						delete item["Commodity Proven Total"]
						delete item["Calculated Proven Total Value"]
						delete item["Commodity Probable Total"]
						delete item["Calculated Probable Total Value"]
						delete item["Proven Probable Total"]
						delete item["Calculated Proven Probable Value"]
						delete item["Commodity Actual Amount"]
						delete item["Commodity Actual Percent"]
						delete item["Commodity Grade Actual Value"]
						delete item["Commodity Grade Actual Percent of Target"]
						delete item["Commodity Cut Off"]
						delete item["Commodity Production Cost per Unit"]
						delete item["Commodity Production Qty"]
						delete item["Commodity Production Unit"]
						delete item["Commodity Production Frequency"]
						delete item["Commodity Production YTD"]
						delete item["Commodity Production Currency"]
						delete item["Commodity Production Grade"]
						delete item["Commodity Strip Ratio"]
						delete item["Processed Tonnes"]
						delete item["Processed Grade"]
						delete item["Processed Recovery"]
						delete item["Processed Commodity Produced"]
						delete item["Processed Commodity Sold"]
						delete item["Total Ore Mined"]
						delete item["Total Mined Grade"]
						delete item["Cost Site Admin per unit"]
						delete item["Cost Stockpile per unit"]
						delete item["Cost Mining per unit"]
						delete item["Cost Processing per unit"]
						delete item["Cost Royalties Refining Other per unit"]
						delete item["Cost Total per unit"]
						delete item["Commodity Notes"]
						delete item["Project Area Other Companies"]
						//
					}
				}
				//
				if (
					indexName === "directors_tier1"
					|| indexName === "directors_tier2"
				) {
					// Tier 1	Company
					// Tier 1	ASXCode
					// Tier 1	Contact
					// Tier 1	Title
					// Tier 2	Qualifications / Experience
					// Tier 2	Other Directorships and History
					// Tier 1	Directors Shares
					// Tier 1	Shares Held
					// Tier 1	Percent Held
					// Tier 1	Total Shares
					// Tier 1	Base Remuneration
					// Tier 1	Total Remuneration
					//
					if (indexName === "directors_tier1") {
						delete item["Qualifications/Experience"]
						delete item["Other Directorships and History"]
					}
					//
				}
				//
				if (
					indexName === "asx_directors_tier1"
					|| indexName === "asx_directors_tier2"
				) {
					if (indexName === "asx_directors_tier1") {
						delete item["Qualifications/Experience"]
						delete item["Other Directorships and History"]
					}
				}
				//
				if (
					indexName === "financials_tier1"
					|| indexName === "financials_tier2"
				) {
					//
				}
				//
				if (
					indexName === "asx_financials_tier1"
					|| indexName === "asx_financials_tier2"
				) {
					//
				}
				//
				if (
					indexName === "shareholders_tier1"
					|| indexName === "shareholders_tier2"
				) {
					// Tier 1	Updated
					// Tier 1	Source Year Of Shareholding
					// Tier 1	Contact
					// Tier 1(Annual Only) & Tier 2(Annual, Directors & Daily)	Annual / Daily
					// Tier 1 % Shares Held
					// Tier 1	SharesHeld
					// Tier 2	Old % Shares Held
					// Tier 2	OldSharesHeld
					// Tier 2	Increase
					// Tier 1	Company
					// Tier 1	ASXCode
					// Tier 2	ShareValue
					if (indexName === "shareholders_tier1") {
						delete item["CurrentSharePercent"] // delete item["% Shares Held"]
						delete item["PreviousSharesHeld"] // delete item["OldSharesHeld"]
						// delete item["Increase"] ????
					}
				}
				//
				if (
					indexName === "asx_shareholders_tier1"
					|| indexName === "asx_shareholders_tier2"
				) {
					if (indexName === "asx_shareholders_tier1") {
						delete item["CurrentSharePercent"] // delete item["% Shares Held"]
						delete item["PreviousSharesHeld"] // delete item["OldSharesHeld"]
						// delete item["Increase"] ????
					}
				}
				//
				if (
					indexName === "marketdata_public_tier1"
					|| indexName === "marketdata_public_tier2"
				) {
					// 
				}
				//
				if (
					indexName === "marketdata_tier1"
					|| indexName === "marketdata_tier2"
				) {
					// 
				}
				//
				if (
					indexName === "asx_marketdata_tier1"
					|| indexName === "asx_marketdata_tier2"
				) {
					//
				}
				//
				return item
			})
		}
		//
		console.log({ jsonDataLength: jsonData.length })
		//
		// for (let csvRow of jsonData) {
		//
		const removeOldDocuments = await ELASTICSERVICE.deleteAllDocuments(indexName)
		if (removeOldDocuments.outcome === 0) {
			await EMAILSERVICE.sendEmail(
				"info@makcorp.net.au",
				lowPriorityEmailList.join(","),
				`Makcorp - Data Load - Could not clear out the index`,
				`<p>Could not clear out the index: ${indexName}</p>`,
				`Could not clear out the index: ${indexName}`
			)
		}
		console.log("Removed: " + indexName)
		//
		const splitAmount = 5000
		const splitData = ELASTICSERVICE.splitByAmount(jsonData, splitAmount)
		let counter = 0
		let totalRun = Math.ceil(jsonData.length / splitAmount)
		//
		for (let group of splitData) {
			//
			counter = counter + 1
			const uploadDocumentResult = await ELASTICSERVICE.uploadDocuments(indexName, group)
			if (uploadDocumentResult.outcome === 0) {
				console.log("Upload Failed")
				await EMAILSERVICE.sendEmail(
					"info@makcorp.net.au",
					lowPriorityEmailList.join(","),
					`Makcorp - Data Load - Could not upload data to Elastic`,
					`<p>Could not upload data to Elastic: ${indexName}</p>`,
					`Could not upload data to Elastic: ${indexName}`
				)
			}
			console.log({ uploadDocumentResult })
			console.log(counter + "/" + totalRun)
			//
		}
		//
		// if (uploadDocumentResult.outcome === 1) {
		// 	console.log("Uploaded: " + JSON.stringify(csvRow))
		// } else {
		// 	console.log("Could not upload!")
		// }
		// }
		//
		// if (uploadDocumentResult.outcome === 0) {
		// 	//
		// 	return {
		// 		outcome: 0
		// 	}
		// 	//
		// }
		//
	},

	async login(req, res, connectionInfo) {
		try {
			//
			if (req.body && req.body.email && req.body.password) {
				//
				const dirtyLoginEmail = req.body.email
				const dirtyLoginPassword = req.body.password
				//
				console.log({ dirtyLoginEmail })
				console.log({ dirtyLoginPassword })
				//
				const cleanLoginEmailResult = User.USERSERVICE.cleanEmail(dirtyLoginEmail)
				const cleanLoginPasswordResult = User.USERSERVICE.cleanPassword(dirtyLoginPassword)
				//
				console.log({ cleanLoginEmailResult })
				console.log({ cleanLoginPasswordResult })
				//
				const cleanLoginEmail = cleanLoginEmailResult.cleanEmail
				const cleanLoginPassword = cleanLoginPasswordResult.cleanPassword
				//
				console.log({ cleanLoginEmail })
				console.log({ cleanLoginPassword })
				//
				// const connectionInfoLogin = await DB.DBSERVICE.connect()
				// if (connectionInfoLogin.outcome === 0) {
				// 	console.log("Could not connect to database")
				// 	return res.status(500).send()
				// }
				//
				const userRecordLogin = await DB.DBSERVICE.getUser(connectionInfo.db, cleanLoginEmail)
				//
				// await DB.DBSERVICE.closeConnection(connectionInfo.client)
				//
				if (userRecordLogin.outcome === 0) {
					//
					await createLog(
						"",
						Log.LOGSERVICE.user_login_issue_message,
						req.path,
						"Could not find the user in the DB",
						connectionInfo
					)
					//
					console.log("Could not find the user")
					return res.status(401).send()
				}

				if (!userRecordLogin.userRecord.is_verified) {
					//
					await createLog(
						"",
						Log.LOGSERVICE.user_login_issue_message,
						req.path,
						"User not veried",
						connectionInfo
					)
					//
					console.log("User not veried.");
					return res.status(400).send();
				}

				const passwordCheckResult = await User.USERSERVICE.checkPassword(cleanLoginPassword, userRecordLogin.userRecord.password)
				console.log({ passwordCheckResult })
				if (passwordCheckResult.outcome === 0) {
					//
					await createLog(
						userRecordLogin.userRecord._id,
						Log.LOGSERVICE.user_login_issue_message,
						req.path,
						"Wrong password",
						connectionInfo
					)
					//
					console.log("Wrong Password")
					return res.status(401).send()
				}
				//
				if (userRecordLogin.userRecord.tier !== "" && DateTime.fromISO(userRecordLogin.userRecord.paid_until) < DateTime.now()) {
					//
					const newUserRecord = {
						...userRecordLogin.userRecord,
						tier: "",
					}
					//
					const updateRecordResult = await DB.DBSERVICE.updateUser(connectionInfo.db, newUserRecord)
					if (updateRecordResult.outcome === 0) {
						return res.status(500).send({})
					}
					//
					const sessionData = {
						email: cleanLoginEmail,
						loggedIn: true,
						tier: ""
					}
					const encode64 = await this.generateElasticKey("")
					//
					req.__session.token = encode64
					//
					return res.status(200).send({
						token: signedToken.token,
						tier: sessionData.tier
					})
				}
				//
				const sessionData = {
					email: cleanLoginEmail,
					loggedIn: true,
					tier: userRecordLogin.userRecord.tier
				}
				//
				const signedToken = await JWTSERVICE.sign({
					exp: Config.JWT.expiry(),
					data: sessionData,
					secret: Config.JWT.secret,
					options: { noTimestamp: true },
				})
				if (signedToken.outcome === 0) {
					//
					await createLog(
						userRecordLogin.userRecord._id,
						Log.LOGSERVICE.user_login_issue_message,
						req.path,
						"Could not create a token",
						connectionInfo
					)
					//
					return res.status(500).send()
					//
				} else {
					//
					await createLog(
						userRecordLogin.userRecord._id,
						Log.LOGSERVICE.user_logged_in_message,
						req.path,
						"",
						connectionInfo
					)
					//
					const encode64 = await this.generateElasticKey(userRecordLogin.userRecord.tier)
					//
					req.__session.token = encode64
					//
					return res.status(200).send({
						token: signedToken.token,
						tier: sessionData.tier
					})
					//
				}
				//
			}
			// else if (req.header("API-Key") && req.header("API-Key").length > 0) {
			// 	//
			// 	const userRecordLogin = await DB.DBSERVICE.getUserByApiKey(connectionInfo.db, req.header("API-Key"))
			// 	//
			// 	if (userRecordLogin.outcome === 0) {
			// 		//
			// 		await createLog(
			// 			"API-Key: " + req.header("API-Key"),
			// 			Log.LOGSERVICE.user_login_issue_message,
			// 			req.path,
			// 			"Could not find the user in the DB",
			// 			connectionInfo
			// 		)
			// 		//
			// 		console.log("Could not find the user")
			// 		return res.status(401).send()
			// 	}
			// 	//
			// 	const sessionData = {
			// 		email: userRecordLogin.userRecord.email,
			// 		loggedIn: true
			// 	}
			// 	//
			// 	const signedToken = await JWTSERVICE.sign({
			// 		exp: Config.JWT.expiry(),
			// 		data: sessionData,
			// 		secret: Config.JWT.secret,
			// 		options: { noTimestamp: true },
			// 	})
			// 	//
			// 	if (signedToken.outcome === 0) {
			// 		//
			// 		await createLog(
			// 			userRecordLogin.userRecord._id,
			// 			Log.LOGSERVICE.user_login_issue_message,
			// 			req.path,
			// 			"Could not create a token",
			// 			connectionInfo
			// 		)
			// 		//
			// 		return res.status(500).send()
			// 		//
			// 	} else {
			// 		//
			// 		await createLog(
			// 			userRecordLogin.userRecord._id,
			// 			Log.LOGSERVICE.user_logged_in_message,
			// 			req.path,
			// 			"",
			// 			connectionInfo
			// 		)
			// 		//
			// 		return res.status(200).send({
			// 			token: signedToken.token
			// 		})
			// 		//
			// 	}
			// 	//
			// }
			else {
				throw new Error
			}
		} catch (e) {
			//
			console.log({ e })
			//
			if (userRecord) {
				await createLog(
					userRecord._id,
					Log.LOGSERVICE.user_login_issue_message,
					req.path,
					JSON.stringify(e),
					connectionInfo
				)
			} else {
				// await createLog(
				//
				// )
			}
			//
			console.log({ e })
			return res.status(401).send()
			//
		}
		//
	},

	async contactus(req, res, connectionInfo) {
		//
		const bodyCheckResult = await this.checkBodyExtraFields(req)
		if (bodyCheckResult.outcome === 0) {
			return res.status(bodyCheckResult.status).send({ message: bodyCheckResult.message })
		}
		//
		let investmentCriteria;
		if (req.body.investmentCriteria === "People") {
			investmentCriteria = "People (Board & Senior Management SH, Remuneration, Exp, Qual)"
		}
		if (req.body.investmentCriteria === "Project Potention") {
			investmentCriteria = "Project Potention (Project state, grades, location etc)"
		}
		if (req.body.investmentCriteria === "Finance") {
			investmentCriteria = "Finance (Project funding support etc)"
		}
		if (req.body.investmentCriteria === "Top 20 Shareholders") {
			investmentCriteria = "Top 20 Shareholders (Who are they & what % do they hold)"
		}
		if (req.body.investmentCriteria === "Share price performance") {
			investmentCriteria = "Share price performance (Short & long term potential, passion, lifestyle etc)"
		}
		if (req.body.investmentCriteria === "Other") {
			investmentCriteria = "Other (Please provide detail)"
		}
		//
		await DB.DBSERVICE.createContactUs(connectionInfo.db, req.body)
		//
		await EMAILSERVICE.sendEmail(
			"info@makcorp.net.au",
			"n@greenfox.dev,j@greenfox.dev,info@makcorp.net.au,steve@makcorp.net.au",
			"Makcorp - Contact Us Form",
			`
<p>Email: ${req.body.email}</p>
<p>First Name: ${req.body.firstName}</p>
<p>Last Name: ${req.body.lastName}</p>
<p>Mobile: ${req.body.phoneNumber}</p>
<p>Country: ${req.body.country}</p>
<p>Referred By: ${req.body.referredBy}</p>
<p>Top 3 Commodities 1: ${req.body.commodityTypes[0]}</p>
<p>Top 3 Commodities 2: ${req.body.commodityTypes[1]}</p>
<p>Top 3 Commodities 3: ${req.body.commodityTypes[2]}</p>
<p>Investment Criteria: ${investmentCriteria}</p>
`,
			`
Email: ${req.body.email}
First Name: ${req.body.firstName}
Last Name: ${req.body.lastName}
Mobile: ${req.body.phoneNumber}
Country: ${req.body.country}
Referred By: ${req.body.referredBy}
Top 3 Commodities 1: ${req.body.commodityTypes[0]}
Top 3 Commodities 2: ${req.body.commodityTypes[1]}
Top 3 Commodities 3: ${req.body.commodityTypes[2]}
Investment Criteria: ${investmentCriteria}
`
		)
		//
		return res.status(200).send()
		//
	},

	async checkBodyExtraFields(req) {
		//
		const first_name = req.body.firstName
		const last_name = req.body.lastName
		const mobile = req.body.phoneNumber
		const state = req.body.state
		const country = req.body.country
		const referred_by = req.body.referredBy
		const top_3_commodities = req.body.commodityTypes
		const investment_criteria = req.body.investmentCriteria
		//
		if (
			//
			typeof first_name === "string"
			&& first_name.length > 0
		) {
			// Good. The extra data that's needed it here
		} else {
			console.log("Missing first name")
			return {
				outcome: 0,
				status: 400,
				message: "Missing first name"
			}
		}
		//
		if (
			//
			typeof last_name === "string"
			&& last_name.length > 0
		) {
			// Good. The extra data that's needed it here
		} else {
			console.log("Missing last name")
			return {
				outcome: 0,
				status: 400,
				message: "Missing last name"
			}
		}
		//
		if (
			typeof mobile === "string"
			&& mobile.length > 0
		) {
			// Good. The extra data that's needed it here
		} else {
			console.log("Missing mobile")
			return {
				outcome: 0,
				status: 400,
				message: "Missing mobile"
			}
		}
		//
		if (
			typeof country === "string"
			&& country.length > 0
		) {
			// Good. The extra data that's needed it here
		} else {
			console.log("Missing country")
			return {
				outcome: 0,
				status: 400,
				message: "Missing country"
			}
		}
		//
		if (
			typeof referred_by === "string"
			&& referred_by.length > 0
		) {
			// Good. The extra data that's needed it here
		} else {
			console.log("Missing reffered by")
			return {
				outcome: 0,
				status: 400,
				message: "Missing referred by"
			}
		}
		//
		if (
			top_3_commodities.length === 3
			&& typeof top_3_commodities[0] === "string"
			&& top_3_commodities[0].length > 0
			&& typeof top_3_commodities[1] === "string"
			&& top_3_commodities[1].length > 0
			&& typeof top_3_commodities[2] === "string"
			&& top_3_commodities[2].length > 0
		) {
			// Good. The extra data that's needed it here
		} else {
			console.log("Missing top 3 commodities")
			return {
				outcome: 0,
				status: 400,
				message: "Missing top 3 commodities"
			}
		}
		//
		if (
			typeof investment_criteria === "string"
			&& investment_criteria.length > 0
		) {
			// Good. The extra data that's needed it here
		} else {
			console.log("Missing investment criteria")
			return {
				outcome: 0,
				status: 400,
				message: "Missing investment criteria"
			}
		}
		//
		return {
			outcome: 1
		}
	},

	async signup(req, res, connectionInfo) {
		try {
			//
			// console.log({ body: req.body })
			//
			const dirtySignupEmail = req.body.email
			const dirtySignupPassword = req.body.password
			//
			const bodyCheckResult = await this.checkBodyExtraFields(req)
			if (bodyCheckResult.outcome === 0) {
				return res.status(bodyCheckResult.status).send({ message: bodyCheckResult.message })
			}
			//
			console.log("##########",{ dirtySignupEmail })
			console.log({ dirtySignupPassword })
			//
			const cleanSignupEmailResult = User.USERSERVICE.cleanEmail(dirtySignupEmail)
			const cleanSignupPasswordResult = User.USERSERVICE.cleanPassword(dirtySignupPassword)
			//
			console.log({ cleanSignupEmailResult })
			console.log({ cleanSignupPasswordResult })
			//
			const cleanSignupEmail = cleanSignupEmailResult.cleanEmail
			const cleanSignupPassword = cleanSignupPasswordResult.cleanPassword
			//
			console.log({ cleanSignupEmail })
			console.log({ cleanSignupPassword })
			//
			const userRecordSignupCheck = await DB.DBSERVICE.getUser(connectionInfo.db, cleanSignupEmail)
			//

			// console.log("userRecordSignupCheck",userRecordSignupCheck)
			if (userRecordSignupCheck.outcome === 1) {
				// A user already exists with this email address. Dont allow a new signup.
				//
				await createLog(
					"",
					Log.LOGSERVICE.user_sign_up_fail,
					req.path,
					"Email address already exists",
					connectionInfo
				)
				//
				res.status(409)
				return res.send()
			}
			//
			// const connectionInfoSignup = await DB.DBSERVICE.connect()
			// if (connectionInfoSignup.outcome === 0) {
			// 	console.log("Could not connect to the database")
			// 	return res.status(500).send()
			// }
			//
			const hashedSignupPassword = await User.USERSERVICE.hashPassword(cleanSignupPassword)
			const userRecordSignup = await User.USERSERVICE.createUserRecord(
				cleanSignupEmail,
				hashedSignupPassword,
				req.body.firstName,
				req.body.lastName,
				req.body.phoneNumber,
				req.body.state,
				req.body.country,
				req.body.referredBy,
				req.body.commodityTypes,
				req.body.investmentCriteria
			)
			console.log({ userRecordSignup })
			const userCreateResult = await DB.DBSERVICE.createUser(connectionInfo.db, userRecordSignup)
			//
			// await DB.DBSERVICE.closeConnection(connectionInfo.client)
			//
			// console.log("%%%%%%%%%%%555",userCreateResult)
			if (userCreateResult.outcome === 0) {
				//
				await createLog(
					"",
					Log.LOGSERVICE.user_sign_up_fail,
					req.path,
					"Could not create user in DB",
					connectionInfo
				)
				//
				console.log("Could not create the user")
				return res.status(500).send()
			}
			//
			await createLog(
				"",
				Log.LOGSERVICE.user_sign_up_success,
				req.path,
				"",
				connectionInfo
			)
			//
			console.log("created user")
			//
			const accountConfirmationEmail = await EMAILSERVICE.sendEmail(
				"info@makcorp.net.au",
				cleanSignupEmail,
				"Makcorp - Account Confirmation",
				`
				<p>Your account created successfully.</p>
				<p>
					Please click on this
					<a href='${config.ENVIRONMENT.production_front_url}/verification?code=${base64.encode(cleanSignupEmail)}' target='_blank'>
					<strong>link</strong></a> to verify this account.
				</p>
				<p></p>`
			)
			// <a href='${config.ENVIRONMENT.development_front_url}/verification?code=${base64.encode(cleanSignupEmail)}' target='_blank'>

			if (accountConfirmationEmail.outcome === 1) {
				await createLog(
					userCreateResult._id,
					Log.LOGSERVICE.email_success,
					req.path,
					"",
					connectionInfo
				)
			} else {
				await createLog(
					userCreateResult._id,
					Log.LOGSERVICE.email_fail,
					req.path,
					"",
					connectionInfo
				)
				console.log("Could not send email")
				return res.status(500).send({ message: "Fail" });
			}
			return res.status(204).send()
			//
		} catch (e) {
			//
			console.log({ e })
			//
			await createLog(
				"",
				Log.LOGSERVICE.user_sign_up_fail,
				req.path,
				JSON.stringify(e),
				connectionInfo
			)
			//
			return res.status(500).send()
		}
		//
	},

	async accountVerification(req, res, connectionInfo) {
		try {
			const decodedEmail = base64.decode(req.body.code);
			const checkUserResult = await getUserForPublic(decodedEmail, connectionInfo);
			if (checkUserResult.outcome === 0) {
				//
				await createLog(
					"",
					Log.LOGSERVICE.user_got_info_fail,
					req.path,
					checkUserResult.message,
					connectionInfo
				)
				//
				return res.status(400).send({ message: "Fail" })
			}
			const userRecord = checkUserResult.userRecord;
			//
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.user_got_info_success,
				req.path,
				"",
				connectionInfo
			)
			//

			const updatedUserRecord = {
				...userRecord,
				is_verified: !0,
			}
			const updateUserResult = await DB.DBSERVICE.updateUser(connectionInfo.db, updatedUserRecord)
			if (updateUserResult.outcome === 1) {
				await createLog(
					userRecord._id,
					Log.LOGSERVICE.user_update_paid_success,
					req.path,
					"",
					connectionInfo
				)
			} else {
				await createLog(
					userRecord._id,
					Log.LOGSERVICE.user_update_paid_fail,
					req.path,
					"",
					connectionInfo
				)
				console.log("Could not update user info")
				res.status(500).send({ message: "Fail" })
			}
			return res.status(200).send();
		} catch(err) {
			//
			await createLog(
				"",
				Log.LOGSERVICE.user_got_info_fail,
				req.path,
				err.message,
				connectionInfo
			)
			//
			return res.status(500).send({ message: "Fail" })
		}
	},

	async getUserInfo(req, res, connectionInfo) {
		const token = req.header("Token")
		const checkUserResult = await checkUserByToken(token, connectionInfo)
		if (checkUserResult.outcome === 0) {
			//
			await createLog(
				"",
				Log.LOGSERVICE.user_got_info_fail,
				req.path,
				checkUserResult.message,
				connectionInfo
			)
			//
			return res.status(401).send()
		}
		const userRecord = checkUserResult.userRecord
		console.log({ userRecord })
		//
		await createLog(
			userRecord._id,
			Log.LOGSERVICE.user_got_info_success,
			req.path,
			"",
			connectionInfo
		)
		//
		const linksRecords = await DB.DBSERVICE.getLinks(connectionInfo.db)
		let links = {}
		if (userRecord.tier === "1") {
			links = linksRecords.links.links.tier1
		} else if (userRecord.tier === "2") {
			links = linksRecords.links.links.tier2
		}
		//
		const returnData = {
			email: userRecord.email,
			tier: userRecord.tier,
			links: links,
			paid_until: userRecord.paid_until,
			paid_date: userRecord.paid_date,
			paid_amount: userRecord.paid_amount,
			firstName: userRecord.first_name || ""
		}
		console.log({ returnData })
		return res.status(200).send(returnData)
	},

	async forgotPassword(req, res, connectionInfo) {
		const checkUserResult = await getUserForPublic(req.body.email, connectionInfo)
		if (checkUserResult.outcome === 0) {
			//
			await createLog(
				"",
				Log.LOGSERVICE.user_got_info_fail,
				req.path,
				checkUserResult.message,
				connectionInfo
			)
			//
			return res.status(400).send({ message: "Fail" })
		}
		const userRecord = checkUserResult.userRecord
		console.log({ userRecord })
		//
		await createLog(
			userRecord._id,
			Log.LOGSERVICE.user_got_info_success,
			req.path,
			"",
			connectionInfo
		)
		//
		const new_password_raw = nanoid()
		const new_password = await User.USERSERVICE.hashPassword(new_password_raw)
		const updatedUserRecord = {
			...userRecord,
			password: new_password
		}
		const updateUserResult = await DB.DBSERVICE.updateUser(connectionInfo.db, updatedUserRecord)
		if (updateUserResult.outcome === 1) {
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.user_update_paid_success,
				req.path,
				"",
				connectionInfo
			)
		} else {
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.user_update_paid_fail,
				req.path,
				"",
				connectionInfo
			)
			console.log("Could not update user info")
			res.status(500).send({ message: "Fail" })
		}
		const forgotPasswordEmail = await EMAILSERVICE.sendEmail(
			"info@makcorp.net.au",
			userRecord.email,
			"Makcorp - New Password",
			`
<p>We have generated a new password for you.</p>
<p>Your new password: ${new_password_raw}</p>
<p></p>
<p>Please login with your new password</p>
			`,
			`
We have generated a new password for you.
Your new password: ${new_password_raw}

Please login with your new password
			`,
		)
		if (forgotPasswordEmail.outcome === 1) {
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.email_success,
				req.path,
				"",
				connectionInfo
			)
		} else {
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.email_fail,
				req.path,
				"",
				connectionInfo
			)
			console.log("Could not send email")
			return res.status(500).send({ message: "Fail" })
		}
		//
		return res.status(200).send()
	},

	async getLinks(req, res, connectionInfo) {
		const token = req.header("Token")
		const checkUserResult = await checkUserByToken(token, connectionInfo)
		if (checkUserResult.outcome === 0) {
			//
			await createLog(
				"",
				Log.LOGSERVICE.user_got_info_fail,
				req.path,
				checkUserResult.message,
				connectionInfo
			)
			//
			return res.status(401).send()
		}
		const userRecord = checkUserResult.userRecord
		console.log({ userRecord })
		//
		await createLog(
			userRecord._id,
			Log.LOGSERVICE.user_got_info_success,
			req.path,
			"",
			connectionInfo
		)
		//
		if (userRecord.email === "test@test.test") {
			//
			const linksRecords = await DB.DBSERVICE.getLinks(connectionInfo.db)
			//
			if (linksRecords.outcome === 1) {
				//
				await createLog(
					userRecord._id,
					Log.LOGSERVICE.got_links_data_success,
					req.path,
					"",
					connectionInfo
				)
				//
				delete linksRecords.links._id
				const links = {
					tier1: linksRecords.links.links.tier1,
					tier2: linksRecords.links.links.tier2
				}
				//
				return res.status(200).send({
					links
				})
				//
			} else {
				await createLog(
					userRecord._id,
					Log.LOGSERVICE.got_links_data_fail,
					req.path,
					"",
					connectionInfo
				)
				return res.status(500).send({ message: "Could not get the links" })
			}
			//
		} else {
			//
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.got_links_data_fail,
				req.path,
				"",
				connectionInfo
			)
			//
			return res.status(401).send({ message: "Not authorized" })
		}
		//
	},

	async uploadResult(req, res, connectionInfo) {
		//
		const token = req.header("Token")
		const checkUserResult = await checkUserByToken(token, connectionInfo)
		if (checkUserResult.outcome === 0) {
			//
			await createLog(
				"",
				Log.LOGSERVICE.user_got_info_fail,
				req.path,
				checkUserResult.message,
				connectionInfo
			)
			//
			return res.status(401).send()
		}
		const userRecord = checkUserResult.userRecord
		console.log({ userRecord })
		//
		await createLog(
			userRecord._id,
			Log.LOGSERVICE.user_got_info_success,
			req.path,
			"",
			connectionInfo
		)
		//
		console.log(req.body)
		const packageRecordResult = await DB.DBSERVICE.getPackage(connectionInfo.db, req.body.packageId)
		console.log({ packageRecordResult })
		if (packageRecordResult.outcome === 1) {
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.user_got_package_success,
				req.path,
				"",
				connectionInfo
			)
			//
		} else {
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.user_got_package_fail,
				req.path,
				"",
				connectionInfo
			)
			//
			console.log("Could not get the package")
			//
			return res.status(500).send()
			//
		}
		const packageRecord = await packageRecordResult.packageRecord
		//
		const paid_until = DateTime.now().plus(packageRecord.time)
		const paid_date = DateTime.now()
		const paid_amount = packageRecord.amount
		//
		const updatedUserRecord = User.USERSERVICE.updateUserRecordWithPayment(
			userRecord,
			packageRecord.tier,
			paid_until,
			paid_date,
			paid_amount,
			packageRecord._id
		)
		//
		const updateUserResult = await DB.DBSERVICE.updateUser(connectionInfo.db, updatedUserRecord)
		if (updateUserResult.outcome === 1) {
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.user_update_paid_success,
				req.path,
				"",
				connectionInfo
			)
			console.log("Updated user info")
			const paymentRecord = {
				_id: nanoid(),
				user_id: userRecord._id,
				package_id: packageRecord._id,
				amount: paid_amount,
				paid_date: paid_date,
				paid_until: paid_until,
				tier: packageRecord.tier,
			}
			try {
				//
				await DB.DBSERVICE.createPaymentHistory(connectionInfo.db, paymentRecord)
				//
			} catch (e) {
				//
				console.log("Could not create a payment history record")
				console.log({ e })
				//
			}
			//
			const encode64 = await this.generateElasticKey(packageRecord.tier)
			//
			req.__session.token = encode64
			//
			req.__session.tier = packageRecord.tier
			//
			res.status(200).send()
		} else {
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.user_update_paid_fail,
				req.path,
				"",
				connectionInfo
			)
			console.log("Could not update user info")
			res.status(500).send()
		}
		//
	},

	async getPackages(req, res, connectionInfo) {
		//
		const packageRecords = await DB.DBSERVICE.getPackages(connectionInfo.db)
		//
		if (packageRecords.outcome === 1) {
			//
			await createLog(
				"",
				Log.LOGSERVICE.got_packages_data_success,
				req.path,
				"",
				connectionInfo
			)
			//
			return res.status(200).send({
				packages: packageRecords.packages
			})
			//
		} else {
			await createLog(
				"",
				Log.LOGSERVICE.got_packages_data_fail,
				req.path,
				"",
				connectionInfo
			)
			return res.status(500).send({ message: "Could not get the packages" })
		}
		//
	},

	async updateLinks(req, res, connectionInfo) {
		const token = req.header("Token")
		const checkUserResult = await checkUserByToken(token, connectionInfo)
		if (checkUserResult.outcome === 0) {
			//
			await createLog(
				"",
				Log.LOGSERVICE.user_got_info_fail,
				req.path,
				checkUserResult.message,
				connectionInfo
			)
			//
			return res.status(401).send()
		}
		const userRecord = checkUserResult.userRecord
		console.log({ userRecord })
		//
		await createLog(
			userRecord._id,
			Log.LOGSERVICE.user_got_info_success,
			req.path,
			"",
			connectionInfo
		)
		//
		if (userRecord.email === "test@test.test") {
			//
			console.log({ linksBody: req.body.links })
			//
			const linksRecords = await DB.DBSERVICE.updateLinks(connectionInfo.db, req.body.links)
			//
			if (linksRecords.outcome === 1) {
				//
				await createLog(
					userRecord._id,
					Log.LOGSERVICE.got_links_data_success,
					req.path,
					"",
					connectionInfo
				)
				//
				return res.status(200).send({
					outcome: "Success"
				})
				//
			} else {
				await createLog(
					userRecord._id,
					Log.LOGSERVICE.got_links_data_fail,
					req.path,
					"",
					connectionInfo
				)
				return req.status(500).send({
					outcome: "Failed"
				})
			}
			//
		} else {
			//
			await createLog(
				userRecord._id,
				Log.LOGSERVICE.got_links_data_fail,
				req.path,
				"",
				connectionInfo
			)
			//
			return res.status(500).send({ outcome: "Failed" })
		}
		//
	},

	async generateElasticKey(tier) {
		//
		var data;
		//
		let user = "public"
		let password = "gogwoj-vorhEr-xosqo4"
		//
		// console.log({ userRecordLogin })
		//
		if (tier === "1") {
			// console.log("TIER1")
			user = "tier1"
			password = "YA94EkQLPixi9K"
		} else if (tier === "2") {
			console.log("TIER2")
			user = "tier2"
			password = "XLj7vkPuq6qRWo"
		}
		//
		data = new Buffer.from(user + ':' + password);
		var encoded64 = data.toString('base64');
		return encoded64
	}

}

const createLog = async (user_id, type, path, message, connectionInfo) => {
	//
	const logRecord = Log.LOGSERVICE.createLogRecord(
		user_id,
		type,
		path,
		message
	)
	//
	const createLogRecordResult = await DB.DBSERVICE.createLog(connectionInfo.db, logRecord)
	//
	if (createLogRecordResult.outcome === 0) {
		console.log("Could not create log:" + JSON.stringify(logRecord))
	}
	//
}

const checkUserByToken = async (token, connectionInfo) => {
	//
	let tokenCheck = false;
	let userRecordResult;
	let errorMessage = "";
	//
	const jwtResult = await JWT.JWTSERVICE.verify(token, Config.JWT.secret)
	if (jwtResult.outcome === 0) {
		console.log({ token })
		console.log({ secret: Config.JWT.secret })
		console.log("Could not verify the JWT")
		errorMessage = "Could not verify the JWT"
	} else {
		const jwt = jwtResult.decoded
		//
		userRecordResult = await DB.DBSERVICE.getUser(connectionInfo.db, jwt.email)
		if (userRecordResult.outcome === 0) {
			console.log("Could not get the user record from the DB by email with token")
			errorMessage = "Could not get the user record from the DB by email with token"
			// return {
			// 	outcome: 0
			// }
		} else {
			tokenCheck = true
		}
	}
	//
	if (tokenCheck === true) {
		return {
			outcome: 1,
			userRecord: userRecordResult.userRecord
		}
	} else {
		return {
			outcome: 0,
			message: errorMessage
		}
	}
	//
}

const getUserForPublic = async (email, connectionInfo) => {
	//
	let userRecordResult;
	let errorMessage = "";
	//
	userRecordResult = await DB.DBSERVICE.getUser(connectionInfo.db, email)
	if (userRecordResult.outcome === 0) {
		console.log("Could not get the user record from the DB by email (public)")
		errorMessage = "Could not get the user record from the DB by email (public)"
		// return {
		// 	outcome: 0
		// }
	}
	//
	if (userRecordResult.outcome === 1) {
		return {
			outcome: 1,
			userRecord: userRecordResult.userRecord
		}
	} else {
		return {
			outcome: 0,
			message: errorMessage
		}
	}
}
