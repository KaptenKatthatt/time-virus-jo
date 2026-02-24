import Button from "../components/Button";
import Scoreboard from "../components/Scoreboard";
import Livematches from "../components/Livematches";
import { WaitingModal } from "../components/LobbyModals";
import type { ScoreBoardPayload } from "@shared/types/payloads.types";
import type { AppClientSocket } from "../types/socket.types";

export let waitingModal: HTMLElement | null = null;

function Lobby(socket: AppClientSocket, payload: ScoreBoardPayload[]) {
	//send start matchmaking to server
	const render = () => {
		const div = document.createElement("div");

		div.className =
			"container d-flex flex-column align-items-center";

		const title = document.createElement("h1");
		title.innerText = "Lobby";
		title.className = "my-5 lacquer-regular text-primary";

		const grid = document.createElement("div");
		grid.className = "lobby-grid w-100";

		const scoreboardWrapper = document.createElement("div");
		scoreboardWrapper.className = "scoreboard-wrapper w-100 my-3";
		const scoreboardEl = Scoreboard(payload);
		scoreboardWrapper.appendChild(scoreboardEl);

		const liveWrapper = document.createElement("div");
		liveWrapper.className = "scoreboard-wrapper w-100 my-3";
		const liveEl = Livematches();
		liveWrapper.appendChild(liveEl);

		const button = Button("Start game", () => {
			console.log("start game");
			// Send join game request to backend
			if (socket.id) {
				console.log("Sending join request");
				socket.emit("playerJoinGameRequest", socket.id);
			}
			waitingModal = WaitingModal();
			document.body.appendChild(waitingModal);
		});

		button.classList.add("fs-3", "mb-5");

		grid.appendChild(liveWrapper);
		grid.appendChild(scoreboardWrapper);

		div.appendChild(title);
		div.appendChild(button);
		div.appendChild(grid);

		return div;
	};

	return render();
}

export default Lobby;
