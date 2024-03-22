let currentScores = { 1: null, 2: null, 3: null };
const DELAY = 200;

let socket;

function socket_in_message_callback(e) {
	const data = JSON.parse(e.data);
	console.log(data);
	switch (data.event) {
		case "update_scores":
			const scores = data.scores;
			let score_array = [];
			for (let s of scores) {
				const score = s["score"];
				score_array.push(score);
			}
			updateScores(score_array);
			break;
		case "update_transform":
			const transforms = data.transforms;
			let transform_array = [];
			for (let t of transforms) {
				const transform = t["transform"];
				transform_array.push(transform);
			}

			for (let i = 0; i < transform_array.length; i++) {
				const transform = transform_array[i];
				const container_el = document.querySelectorAll(
					`.c-${i + 1}-container`
				);
				container_el.forEach((el) => {
					console.log("el.style.left :>> ", el.style.left);
					el.style.left = transform["dx_px"] + "px";
					console.log("el.style.left :>> ", el.style.left);
					el.style.top = transform["dy_px"] + "px";
					el.style.transform = `scale(${transform["scale"]}) rotate(${transform["rotate_deg"]}deg)`;
				});
			}
			break;
		default:
			console.log("Unknown event for incoming message.");
	}
}

webcg.on("data", async (data) => {
	if (socket === undefined && data.host) {
		socket = new WebSocket("ws://" + data.host + "/ws/scores/");
		socket.onopen = (e) => {
			console.log("Socket successfully connected.");
			socket.send(JSON.stringify({ event: "get_points" }));
			socket.send(JSON.stringify({ event: "get_transform" }));
		};
		socket.onclose = (e) => {
			console.log("Chat socket closed unexpectedly");
		};
		socket.onmessage = socket_in_message_callback;
		return;
	}

	if (data.team1 && data.team2 && data.team3) {
		updateScores([data.team1, data.team2, data.team3]);
	}
});

webcg.on("play", () => {});

webcg.on("stop", async () => {
	await pullAll();
});

document.addEventListener("DOMContentLoaded", () => {
	const videos = document.querySelector("#n-videos-collection");
	for (let j = 1; j < 4; j++) {
		const cam_container = document.createElement("div");
		cam_container.classList.add(`c-${j}-container`, "c-container");
		videos.appendChild(cam_container);
		for (let segment of ["intro", "outro"]) {
			for (let i = 0; i < 6; i++) {
				const video = document.createElement("video");
				video.classList.add(`n-video`, `c-${j}`);
				video.id = `video-${segment}-n${i}-c${j}`;
				video.preload = "none";
				const source = document.createElement("source");
				source.src = `assets/videos/${segment}/n${i}/c${j}.webm`;
				source.type = "video/webm";
				video.load();
				cam_container.appendChild(video);
				video.appendChild(source);
			}
		}
	}
});

function pushVideo(n, c) {
	const inVideo = document.querySelector(`#video-intro-n${n}-c${c}`);
	const outVideo = document.querySelector(`#video-outro-n${n}-c${c}`);

	inVideo.style.opacity = 1;
	inVideo.play();

	outVideo.pause();
	outVideo.currentTime = 0;
	outVideo.style.opacity = 0;
}

function pullVideo(n, c) {
	const inVideo = document.querySelector(`#video-intro-n${n}-c${c}`);
	const outVideo = document.querySelector(`#video-outro-n${n}-c${c}`);

	outVideo.style.opacity = 1;
	outVideo.play();

	inVideo.pause();
	inVideo.currentTime = 0;
	inVideo.style.opacity = 0;
}

async function updateScore(c, score) {
	const currentScore = currentScores[c];
	if (score !== currentScore) {
		if (currentScore !== null) {
			pullVideo(currentScore, c);
			await sleep(800);
		}
		currentScores[c] = score;
		pushVideo(score, c);
	}
}

async function updateScores(scores) {
	for (let i = 1; i <= scores.length; i++) {
		const score = parseInt(scores[i - 1]);
		await updateScore(i, score);
		await sleep(DELAY);
	}
}

async function pullAll() {
	console.log("pulling all");
	for (let i = 1; i <= Object.keys(currentScores).length; i++) {
		pullVideo(currentScores[i], i);
		await sleep(DELAY);
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
