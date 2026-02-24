import Button from "../components/Button";
import Scoreboard from "../components/Scoreboard";
import { WaitingModal } from "../components/LobbyModals";
import type { ScoreBoardPayload } from "@shared/types/payloads.types";
import type { AppClientSocket } from "../types/socket.types";

export let waitingModal: HTMLElement | null = null;

function Lobby(socket: AppClientSocket, payload: ScoreBoardPayload[]) {
	// TODO Move logic from button to here

	//send start matchmaking to server
	const render = () => {
		const div = document.createElement("div");

		div.className =
			"container d-flex flex-column align-items-center";

		const title = document.createElement("h1");
		title.innerText = "Lobby";
		title.className = "my-5 lacquer-regular text-primary";

		const scoreboardWrapper = document.createElement("div");
		scoreboardWrapper.className = "scoreboard-wrapper w-100 mb-3";
		const scoreboardEl = Scoreboard(payload);
		scoreboardWrapper.appendChild(scoreboardEl);

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

		button.classList.add("fs-3", "mb-4");

		div.appendChild(title);
		div.appendChild(button);
		div.appendChild(scoreboardWrapper);

		return div;
	};

	return render();
}

export default Lobby;
