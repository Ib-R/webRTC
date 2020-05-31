const fs = require("fs");
const { PeerServer } = require("peer");

const peerServer = PeerServer({
	port: 80,
	path: "/",
	ssl: {
		key: fs.readFileSync("sslcert/key.pem"),
		cert: fs.readFileSync("sslcert/cert.pem"),
	},
});

console.log("PeerServer is running on port 80 with SSL");
