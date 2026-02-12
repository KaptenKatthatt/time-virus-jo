import Scoreboard from "../components/scoreboard";

function Lobby() {
	//send start matchmaking to server
	const render = () => {
		const div = document.createElement("div");

		div.className =
			"container d-flex flex-column justify-content-center align-items-center vh-100";

		div.innerHTML = `
			<div>
			</div>
		`;

		const scoreboardEl = Scoreboard();

		const button = Button("Start game", () => {
			console.log("start game");
		});

		div.appendChild(scoreboardEl);
		div.appendChild(button);

		return div;
	};
	return render();
}

function Button(text: string, cb?: (event?: PointerEvent) => void) {
	const listener = (event: PointerEvent) => {
		if (cb) {
			cb(event);
		}
	};

	const render = () => {
		const button = document.createElement("button");

		button.innerText = text;
		button.addEventListener("click", listener);

		return button;
	};
	return render();
}

export default Lobby;
