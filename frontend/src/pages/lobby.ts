import Button from "../components/Button";
import Scoreboard from "../components/Scoreboard";
import { WaitingModal } from "../components/LobbyModals";
import type { ScoreBoardPayload } from "@shared/types/payloads.types";
import type { AppClientSocket } from "../types/socket.types";

export let waitingModal: HTMLElement | null = null;

function Lobby(socket: AppClientSocket, payload: ScoreBoardPayload[]) {
	// TODO Move logic from button to here
	socket.on("scoreboard:data", async () => {});
	//send start matchmaking to server
	const render = () => {
		const div = document.createElement("div");

		div.className =
			"container d-flex flex-column justify-content-center align-items-center vh-100 gap-4";

		div.innerHTML = `
			<div>
			</div>
		`;

		const scoreboardEl = Scoreboard(payload);

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

		button.classList.add("fs-2");

		div.appendChild(scoreboardEl);
		div.appendChild(button);

		return div;
	};

	return render();
}

export default Lobby;
