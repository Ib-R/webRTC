const socket = io("https://radiant-peak-92517.herokuapp.com");
let socketId = "";

socket.on("connected", (data) => {
	socketId = data.id;
	connectToPeerServer();
});

function connectToPeerServer() {
	// let peer = new Peer(socketId, {
	// 	host: "localhost",
	// 	port: 9000,
	// 	secure: true,
	// 	debug: 3,
	// });
	let peer = new Peer(socketId, {
		host: "radiant-peak-92517.herokuapp.com",
		port: 443,
		secure: true,
		debug: 3,
	});

	peerEvents(peer);
}

// let getUserMedia =
// 	navigator.getUserMedia ||
// 	navigator.webkitGetUserMedia ||
// 	navigator.mozGetUserMedia;

function peerEvents(peer) {
	console.log(peer);
	socket.emit("peerConnected", { connected: true });

	if (peer) {
		peer.on("open", (id) => (document.getElementById("id").value = id));

		// Incoming connection
		peer.on("connection", (conn) => {
			showAlert(`Now peered with - ${conn.peer}`);

			conn.on("open", () => onConnectionOpen(conn, conn.peer, "Incomming"));
		});

		// Outgoing connection
		document.getElementById("connect").addEventListener("click", function () {
			let destId = document.getElementById("otherId").value;
			const conn = peer.connect(destId);

			conn.on("open", () => onConnectionOpen(conn, destId, "Outgoing"));
		});

		// Incoming Call
		peer.on("call", async function (call) {
			let answer = onCall ? false : confirm(`Answer call from ${call.peer}`);

			if (answer) {				
				try {
					let stream = await navigator.mediaDevices.getUserMedia({
						video: true,
						audio: true,
					});

					// Set call A/V configuration
					stream.getAudioTracks()[0].enabled = audioCheck;
					stream.getVideoTracks()[0].enabled = videoCheck;

					call.answer(stream); // Answer the call with an A/V stream.

					call.on("stream", (remoteStream) =>
						onStream(remoteStream, stream, call.peer)
					);

					call.on("close", () => onCallClose(stream));

					document.getElementById("closeStream").onclick = () => call.close();
				} catch (error) {
					console.log("Failed to get local stream", error);
				}
			} else {
				socket.emit("call-reject", { callerId: call.peer });
			}
		});

		// Outgoing Call
		document.getElementById("call").onclick = async function () {
			if (onCall) {
				console.log('Already on call');
				
				return false;
			}

			let destId = document.getElementById("otherId").value;
			if (!destId) {
				showAlert(`Enter dest. ID before calling`);
				return;
			}

			showAlert(`Trying to call ${destId}...`);

			try {
				let stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});

				stream.getAudioTracks()[0].enabled = audioCheck;
				stream.getVideoTracks()[0].enabled = videoCheck;

				let call = peer.call(destId, stream); // Make an A/V stream call.

				socket.on('call-rejected', () => onCallClose(stream));

				showAlert(`Calling ${destId}...`);

				call.on("stream", (remoteStream) =>
					onStream(remoteStream, stream, destId)
				);

				call.on("close", () => onCallClose(stream));

				call.on("error", (err) => console.log("Call error: ", err));

				document.getElementById("closeStream").onclick = () => call.close();
			} catch (error) {
				console.log("Failed to get local stream", error);
			}
		};

		peer.on("disconnected", function () {
			alert(`Peer disconnected`);
		});

		peer.on("close", function () {
			alert(`Peer connection closed`);
		});

		setInterval(() => {
			console.log("Peer connections: ", peer.connections);
		}, 5000);
	} else {
		setTimeout(() => {
			peerEvents();
		}, 2000);
	}
}
