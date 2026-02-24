import Button from "../components/Button";
import Scoreboard from "../components/Scoreboard";
import Livematches from "../components/Livematches";
import { WaitingModal } from "../components/LobbyModals";
import type { LobbyUpdatePayload } from "@shared/types/payloads.types";
import type { AppClientSocket } from "../types/socket.types";

export let waitingModal: HTMLElement | null = null;

export function Lobby(socket: AppClientSocket, payload: LobbyUpdatePayload) {
	// TODO Move logic from button to here

	//send start matchmaking to server
	const div = document.createElement("div");

	div.className = "container d-flex flex-column align-items-center";

	const title = document.createElement("h1");
	title.innerText = "Lobby";
	title.className = "my-5 lacquer-regular text-primary";

	const scoreboardWrapper = document.createElement("div");
	scoreboardWrapper.className = "scoreboard-wrapper w-100 mb-3";
	const scoreboardEl = Scoreboard(payload);
	scoreboardWrapper.appendChild(scoreboardEl);

	const liveWrapper = document.createElement("div");
	liveWrapper.className = "scoreboard-wrapper w-100 mb-5";
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

	button.classList.add("fs-3", "mb-4");

	div.appendChild(title);
	div.appendChild(button);
	div.appendChild(liveWrapper);
	div.appendChild(scoreboardWrapper);

	return {
		element: div,
		updateGameTables: (payload: LobbyUpdatePayload) => {},
	};
}
