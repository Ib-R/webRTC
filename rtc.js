let peer = new Peer("", {
	host: "radiant-peak-92517.herokuapp.com",
	port: 443,
	secure: true,
	debug: 3,
});
let getUserMedia =
	navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia;

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
	let answer = confirm("Answer call");

	try {
		let stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});

		// Set call A/V configuration
		stream.getAudioTracks()[0].enabled = audioCheck;
		stream.getVideoTracks()[0].enabled = videoCheck;

		call.answer(stream); // Answer the call with an A/V stream.

		call.on("stream", (remoteStream) => {
			answer ? onStream(remoteStream, stream, call.peer) : call.close();
		});

		call.on("close", () => onCallClose(stream));

		document.getElementById("closeStream").onclick = () => call.close();
	} catch (error) {
		console.log("Failed to get local stream", error);
	}
});

// Outgoing Call
document.getElementById("call").onclick = async function () {
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

		showAlert(`Calling ${destId}...`);

		call.on("stream", (remoteStream) => onStream(remoteStream, stream, destId));

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

function onConnectionOpen(conn, peerToAdd, connDirection) {
	updatePeers(peerToAdd);

	conn.on("data", (data) => {
		showMsg(data, connDirection);
	});

	document.getElementById("send").onclick = () => {
		let msgToSend = document.getElementById("msg").value;
		console.log(`msgToSend: ${msgToSend}`);

		conn.send(msgToSend);
	};
}

function onStream(remoteStream, stream, peerToAdd) {
	updatePeers(peerToAdd);
	showVideoStream(remoteStream, stream);
	document.getElementById("audioCheck").onchange = () => {
		audioCheck = !audioCheck;
		stream.getAudioTracks()[0].enabled = audioCheck;
	};
	document.getElementById("videoCheck").onchange = () => {
		videoCheck = !videoCheck;
		stream.getVideoTracks()[0].enabled = videoCheck;
	};
}

function onCallClose(stream) {
	showAlert("Call disconnected");
	stream.getTracks().forEach((track) => track.stop());
	document.getElementById("videoDiv").classList.add("hide");
}

setInterval(() => {
	console.log("Peer connections: ", peer.connections);
}, 5000);
