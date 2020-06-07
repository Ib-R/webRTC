const io = require("socket.io")(server);
io.on("connection", (socket) => {
	console.log(`Socket with ID: ${socket.id} connected`);

	socket.emit("connected", { id: socket.id });

	socket.on("peerConnected", (data) => {
		// console.log(data);
	});

	socket.on("call-reject", (data) => {
		console.log(data);

		io.to(data.callerId).emit("call-rejected");
	});
});
