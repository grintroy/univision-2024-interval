webcg.on("data", (data) => {
	const title = document.querySelector("#bigtitle");
	title.innerHTML = data.title;
});

webcg.on("play", () => {
	const title = document.querySelector("#bigtitle");
	title.classList.add("in");
	title.classList.remove("init", "out");
});

webcg.on("stop", () => {
	const title = document.querySelector("#bigtitle");
	title.classList.add("out");
	title.classList.remove("in");
	setTimeout(() => {
		title.classList.add("init");
		title.classList.remove("out");
	}, 700);
});
