let socket;

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

document.getElementById("form-connect").addEventListener("submit", (e) => {
	e.preventDefault();
	const form_data = new FormData(document.getElementById("form-connect"));
	const host = form_data.get("host");

	socket = new WebSocket("ws://" + host + "/ws/scores/");

	socket.onopen = (e) => {
		const button = document.getElementById("form-connect-button");
		button.classList.remove("btn-success");
		button.classList.add("btn-danger");
		button.textContent = "Connected";
		button.onclick = () => {
			socket.close();
		};

		const input = document.getElementById("form-connect-input");
		input.disabled = true;

		const container = document.getElementById("controls");
		container.querySelectorAll("input, button").forEach((input) => {
			input.disabled = false;
		});

		console.log("Socket successfully connected.");
	};

	socket.onclose = (e) => {
		const button = document.getElementById("form-connect-button");
		button.classList.remove("btn-danger");
		button.classList.add("btn-success");
		button.textContent = "Connect";
		const input = document.getElementById("form-connect-input");
		input.disabled = false;

		const container = document.getElementById("controls");
		container.querySelectorAll("input, button").forEach((input) => {
			input.disabled = true;
		});

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
					const score_element = document.getElementById(
						`score-${color}`
					);
					score_element.textContent = score;
				}
				break;
			case "update_transform":
				break;
			default:
				console.log("Unknown event for incoming message.");
		}
	};
});

document.addEventListener("DOMContentLoaded", function () {
	host_field = document.getElementById("form-connect-input");
	if (host_field.value) {
		const button = document.getElementById("form-connect-button");
		button.click();
	} else {
		const container = document.getElementById("controls");
		container.querySelectorAll("input, button").forEach((input) => {
			input.disabled = true;
		});
	}
});
