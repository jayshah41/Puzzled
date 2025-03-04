const express = require('express');
const bodyParser = require("body-parser");
var cors = require('cors')
// var request = require('request');
const proxy = require('express-http-proxy');
const JWT = require("./models/jwt");
const cookieParser = require("cookie-parser");

// const kibana_url = "https://8fdfaee6152c4c7e8e906d57cf6ca7cc.us-central1.gcp.cloud.es.io:9243"
const kibana_url = "https://kibana.makcorp.net.au"
// var sessions = require("client-sessions")
// var sessions = require("cookie-session")
var sessions = require("client-sessions")
var cookieSession = require('cookie-session')

// var httpProxy = require('http-proxy');
// var apiProxy = httpProxy.createProxyServer();
// var session = require('express-session')

const port = 80
// const port = 8081
const DB = require("./models/db");
const Config = require("./config");

const { ROUTES } = require("./routes");

const app = express();

const origin = (() => {
	if (Config.ENVIRONMENT.environment === "development") {
		return Config.ENVIRONMENT.development_front_url
	} else {
		return Config.ENVIRONMENT.production_front_url
	}
})()

app.use(cors({ credentials: true, origin: [origin,"https://makcorp.net.au","http://localhost:4200","http://localhost:8081"] }))

// app.use(sessions({
// 	name: 'session',
// 	keys: ["sefwef"],
// 	// Cookie Options
// 	maxAge: 24 * 60 * 60 * 1000 // 24 hours
// }))

app.use(cookieParser());

app.set('trust proxy', 1) // trust first proxy

// app.use(cookieSession({
// 	name: 'session',
// 	keys: ['key1', 'key2']
// }))

app.use(sessions({
	proxy: true,
	secureProxy: true,
	cookieName: '__session', // cookie name dictates the key name added to the request object
	secret: '9283jfv9283ufj2983urj2f983u2j938rufj', // should be a large unguessable string
	duration: 1000 * 60 * 60, // how long the session will stay valid in ms (60 minutes)
	activeDuration: 1000 * 60 * 60, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
	cookie: {
		// domain: "https://test-local.au.ngrok.io",
		// sameSite: "lax",
		path: '/', // cookie will only be sent to requests under '/'
		// maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
		ephemeral: false, // when true, cookie expires when the browser closes
		httpOnly: true, // when true, cookie is not accessible from javascript
		secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
	}
}));

// app.set('trust proxy', true);

let once = false
// app.use(bodyParser.json());

app.use(bodyParser.json({limit: '50mb'}));

let connectionInfo;

app.use(async (req, res, next) => {
	//
	res.header("Cache-Control", "private")
	//
	next()
	//
})

app.use(async (req, res, next) => {
	// CORS
	// Set CORS headers for preflight requests
	// Allows GETs from any origin with the Content-Type header
	// and caches preflight response for 3600s
	// console.log({ session: req.session })
	// const allowedOrigins = ['http://localhost:4200', 'https://distracted-morse-7c0b02.netlify.app', 'https://test-local.au.ngrok.io'];
	// console.log({ headers: req.headers })
	// const origin = req.headers.origin;
	// console.log({ origin })
	// if (allowedOrigins.includes(origin)) {
	// res.set('Access-Control-Allow-Origin', 'https://distracted-morse-7c0b02.netlify.app');
	// }
	res.set('Access-Control-Allow-Credentials', 'true')
	if (req.method === 'OPTIONS') {
		// Send response to OPTIONS requests
		// res.set('Access-Control-Allow-Methods', 'GET');
		// res.set('Access-Control-Allow-Methods', 'POST');
		// res.set('Access-Control-Allow-Methods', 'OPTIONS');
		res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
		res.set('Access-Control-Allow-Headers', '*');
		// res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Token');
		// res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization, Token");
		//
		res.set("X-Forwarded-Proto", "https")
		res.set('Access-Control-Max-Age', '3600');
		res.status(204).send('');
		return
	}
	//
	// (async () => {
	if (connectionInfo === undefined) {
		connectionInfo = await DB.DBSERVICE.connect()
		if (connectionInfo.outcome === 0) {
			console.log("Could not connect to the database")
			return res.status(500).send()
		}
	}
	// })()

	try {
		//
		// console.log({ Path: req.path })
		// console.log({ Method: req.method })
		// console.log({ Environment: Config.ENVIRONMENT.environment })
		// console.log({ Headers: JSON.stringify(req.headers) })
		// console.log({ Query: req.params })
		// console.log({ Body: req.body })
		// console.log({ Body: req.body.toString() })
		//
	} catch (e) {
		console.log({ e })
		res.status(500).send()
		return
	}
	next()
})

app.post("/process", async (req, res) => {
	//
	ROUTES.convertData(req, res)
	//
})

app.post("/api/users/login", async (req, res) => {
	//
	ROUTES.login(req, res, connectionInfo)
	//
})

app.post("/api/users/signup", async (req, res) => {
	//
	// console.log({ signupbody: req.body })
	ROUTES.signup(req, res, connectionInfo)
	//
})

app.post("/api/account/verification", async (req, res) => {
	//
	// console.log({ body: req.body })
	ROUTES.accountVerification(req, res, connectionInfo);
	//
})

app.post("/api/contactus", async (req, res) => {
	//
	console.log({ signupbody: req.body })
	ROUTES.contactus(req, res, connectionInfo)
	//
})

app.get("/api/users/info", async (req, res) => {
	//
	ROUTES.getUserInfo(req, res, connectionInfo)
	//
})

app.post("/api/users/forgotpassword", async (req, res) => {
	//
	ROUTES.forgotPassword(req, res, connectionInfo)
	//
})

app.get("/api/links", async (req, res) => {
	ROUTES.getLinks(req, res, connectionInfo)
})

app.post("/api/links", async (req, res) => {
	ROUTES.updateLinks(req, res, connectionInfo)
})

app.post("/create-payment-intent", async (req, res) => {
	ROUTES.createPaymentIntent(req, res, connectionInfo)
})

app.post("/api/user/upload-result", async (req, res) => {
	console.log({ body: req.body })
	ROUTES.uploadResult(req, res, connectionInfo)
})

app.get("/api/packages", async (req, res) => {
	ROUTES.getPackages(req, res, connectionInfo)
})

// app.get('/kibana/*', function (req, res) {
// 	console.log(req.method + ' : ' + req.url);
// 	req.url = req.url.replace('/kibana', '');
// 	// console.log({ req })
// 	user = "tier2"
// 	password = "XLj7vkPuq6qRWo"
// 	data = new Buffer.from(user + ':' + password);
// 	var encoded64 = data.toString('base64');
// 	//
// 	req.headers.Authorization = 'Basic ' + encoded64;
// 	req.headers.host = "8fdfaee6152c4c7e8e906d57cf6ca7cc.us-central1.gcp.cloud.es.io"
// 	proxyget.web(req, res, { target: kibana_url });
// });

// app.post('/kibana/*', function (req, res) {
// 	console.log(req.method + ' : ' + req.url);
// 	// console.log({ req })
// 	req.url = req.url.replace('/kibana', '');
// 	user = "tier2"
// 	password = "XLj7vkPuq6qRWo"
// 	data = new Buffer.from(user + ':' + password);
// 	var encoded64 = data.toString('base64');
// 	//
// 	req.headers.Authorization = 'Basic ' + encoded64;
// 	req.headers.host = "8fdfaee6152c4c7e8e906d57cf6ca7cc.us-central1.gcp.cloud.es.io"
// 	proxypost.web(req, res, { target: kibana_url });
// });

app.use("/", proxy(kibana_url, {
	// proxyReqPathResolver: async (req) => {
	// 	return req.url.replace('/kibana', '')
	// 	// console.log(req.url)
	// 	// if (req.url.split("/")[1] === "aa") {
	// 	// 	console.log("Found")
	// 	// 	console.log("/" + req.url.split("/").slice(2, req.url.length).join("/"))
	// 	// 	// return null
	// 	// 	return "/" + req.url.split("/").slice(2, req.url.length).join("/")
	// 	// } else {
	// 	// 	// return req.url
	// 	// 	return req.url
	// 	// }
	// 	// return null
	// 	// console.log({ oldUrl: req.url })
	// 	// let newUrl = req.url
	// 	// console.log(req.url.split("/")[1])
	// 	// if (req.url.split("/")[1] === "proxy") {
	// 	// 	newUrl = "/" + req.url.split("/").slice(2, req.url.length).join("/")
	// 	// }
	// 	// console.log({ newUrl })
	// 	// return newUrl
	// 	// console.log(req.path)
	// 	// console.log(req.path.split("/")[1])
	// 	// return req.path
	// 	// if (req.baseUrl.split("/")[1] === "aa") {
	// 	// 	console.log("Found")
	// 	// 	console.log("/" + req.baseUrl.split("/").slice(3, req.baseUrl.length).join("/"))
	// 	// 	return null
	// 	// } else {
	// 	// 	// return req.baseUrl
	// 	// 	return req.baseUrl
	// 	// }
	// 	// return null
	// },
	proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
		return new Promise(async (resolve, reject) => {
			//
			// console.log({ url: srcReq.originalUrl })
			// let token
			// console.log({ session: srcReq.session })
			if (srcReq.__session && srcReq.__session.token) {
				token = srcReq.__session.token
				// console.log({ token })
			} else {
				var data;
				//
				let user = "public"
				let password = "gogwoj-vorhEr-xosqo4"
				//
				data = new Buffer.from(user + ':' + password);
				token = data.toString('base64');
				//
			}
			//
			proxyReqOpts.headers['Authorization'] = 'Basic ' + token;
			resolve(proxyReqOpts);
		})
	},
	https: true,
}));



app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})