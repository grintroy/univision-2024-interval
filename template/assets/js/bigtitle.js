const MOTION_BLUR_DELAY = 2; // ms

webcg.on("data", (data) => {
	const title = document.querySelectorAll(".title");
	title.forEach((element) => {
		element.innerHTML = data.title;
	});
});

webcg.on("play", () => {
	const title_container = document.querySelector("#bigtitle");
	title_container.classList.add("in");
	title_container.classList.remove("init", "out");

	const title = document.querySelectorAll(".title");
	let delay = 0;
	title.forEach((element) => {
		setTimeout(() => {
			element.classList.add("in");
			element.classList.remove("init", "out");
		}, delay);
		delay += MOTION_BLUR_DELAY;
	});
});

webcg.on("stop", () => {
	const title_container = document.querySelector("#bigtitle");
	title_container.classList.add("out");
	title_container.classList.remove("in");
	setTimeout(() => {
		title_container.classList.add("init");
		title_container.classList.remove("out");
	}, 1200);

	const title = document.querySelectorAll(".title");
	let delay = 0;
	title.forEach((element) => {
		setTimeout(() => {
			element.classList.add("out");
			element.classList.remove("in");
		}, delay);
		setTimeout(() => {
			element.classList.add("init");
			element.classList.remove("out");
		}, 1000);
		delay += MOTION_BLUR_DELAY;
	});
});
