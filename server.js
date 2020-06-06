const fs = require("fs"),
	privateKey = fs.readFileSync("sslcert/key.pem", "utf8"), // SSL cert
	certificate = fs.readFileSync("sslcert/cert.pem", "utf8"),
	credentials = { key: privateKey, cert: certificate }, // add to createServer and change http to https
	https = require("https"),
	http = require("http"),
	express = require("express"),
	app = express(),
	httpsServer = http.createServer(app),
	port = process.env.PORT || 9000,
	{ ExpressPeerServer } = require("peer"),
	cors = require("cors");

const corsOptions = {
	origin: "https://ib-r.github.io",
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};


const peerServer = ExpressPeerServer(httpsServer, {
	debug: true,
	path: "/",
	cors: false,
});

app.use(cors(corsOptions));
app.use("/", peerServer);

app.get('/s', (req, res, next) => {
	res.json({hello: 123});
})

httpsServer.listen(port);

console.log(`Server is running on port ${port} with SSL`);
