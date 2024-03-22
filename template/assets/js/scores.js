let currentScores = { 1: null, 2: null, 3: null };
const DELAY = 200;

webcg.on("data", (data) => {
	if (!data.team1 && !data.team2 && !data.team3) {
		updateScores([0, 0, 0]);
	}

	if (data.team1 && data.team2 && data.team3) {
		updateScores([data.team1, data.team2, data.team3]);
	}
});

webcg.on("play", async () => {});

webcg.on("stop", async () => {
	await pullAll();
});

document.addEventListener("DOMContentLoaded", () => {
	const videos = document.querySelector("#n-videos-collection");
	for (let segment of ["intro", "outro"]) {
		for (let i = 0; i < 6; i++) {
			for (let j = 1; j < 4; j++) {
				const video = document.createElement("video");
				video.classList.add(`n-video`, `c-${j}`);
				video.id = `video-${segment}-n${i}-c${j}`;
				video.preload = "none";
				const source = document.createElement("source");
				source.src = `assets/videos/${segment}/n${i}/c${j}.webm`;
				source.type = "video/webm";
				video.load();
				videos.appendChild(video);
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
	console.log(n, c);
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
