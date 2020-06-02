let peers = [];
let audioCheck = true;
let videoCheck = false;

// document.getElementById('audioCheck').onchange = () => audioCheck = !audioCheck;
// document.getElementById('videoCheck').onchange = () => videoCheck = !videoCheck;

function showMsg(msg, type) {
	let newMsg = document.createElement("p");
	newMsg.innerText = `${type} connection: ${msg}`;
	document.getElementById("msgs").appendChild(newMsg);
}

function showAlert(msg) {
	let alertDiv = document.getElementById("alert");
	alertDiv.innerHTML = msg;
	alertDiv.classList.remove("hide");
}

function showVideoStream(remoteStream, localStream) {
	let remoteVideo = document.getElementById("videoChat");
	let localVideo = document.getElementById("localStream");
	document.getElementById("videoDiv").classList.remove("hide");
	remoteVideo.srcObject = remoteStream;
	remoteVideo.play();
	localVideo.srcObject = localStream;
	localVideo.play();
}

function updatePeers(newPeer = null) {
	newPeer ? peers.push(newPeer) : null;
	peers = [...new Set(peers)];

	let peersList = document.getElementById("peersList");
	peersList.innerHTML = "";
	peers.forEach((peer) => {
		let peerItem = document.createElement("li");
		peerItem.innerText = peer;
		peersList.appendChild(peerItem);
	});
}

function copyToClipboard(id) {
	/* Get the text field */
	var copyText = document.getElementById(id);

	/* Select the text field */
	copyText.select();
	copyText.setSelectionRange(0, 99999); /*For mobile devices*/

	/* Copy the text inside the text field */
	document.execCommand("copy");

	alert("Copied the text: " + copyText.value);
}
