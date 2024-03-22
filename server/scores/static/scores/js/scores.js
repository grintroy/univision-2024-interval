const HOST = "127.0.0.1:8000";

const socket = new WebSocket("ws://" + HOST + "/ws/scores/");

socket.onopen = (e) => {
	console.log("Socket successfully connected.");
};

socket.onclose = (e) => {
	console.log("Chat socket closed unexpectedly");
};

socket.onmessage = (e) => {
	const data = JSON.parse(e.data);
	console.log(data);
	switch (data.event) {
		case "update_scores":
			const scores = data.scores;
			for (let s of scores) {
				const color = s["color"];
				const score = s["score"];
				const score_element = document.getElementById(`score-${color}`);
				score_element.textContent = score;
			}
			break;
		case "update_transform":
			break;
		default:
			console.log("Unknown event for incoming message.");
	}
};

function add_points(color, n) {
	socket.send(JSON.stringify({ event: "add_points", color: color, n: n }));
}

function set_points(color, n) {
	socket.send(JSON.stringify({ event: "set_points", color: color, n: n }));
}

function reset_scores(color) {
	socket.send(JSON.stringify({ event: "reset_scores", color: color }));
}

function reset_all_scores() {
	socket.send(JSON.stringify({ event: "reset_all_scores" }));
}

function reset_all_transformations() {
	socket.send(JSON.stringify({ event: "reset_all_transformations" }));
}

function transform(color, mode, value) {
	socket.send(
		JSON.stringify({
			event: "transform",
			color: color,
			mode: mode,
			value: value
		})
	);
}

document.querySelectorAll(".form-points").forEach((form) => {
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const form_data = new FormData(form);
		const color = form_data.get("color");
		const points = form_data.get("points");
		set_points(color, points);
	});
});
