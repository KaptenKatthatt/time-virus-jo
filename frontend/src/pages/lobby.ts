import Button from "../components/Button";
import Scoreboard from "../components/Scoreboard";
import { WaitingModal } from "../components/LobbyModals";
import type { LobbyUpdatePayload } from "@shared/types/payloads.types";
import type { AppClientSocket } from "../types/socket.types";

export let waitingModal: HTMLElement | null = null;

export function Lobby(socket: AppClientSocket, payload: LobbyUpdatePayload) {
	// TODO Move logic from button to here

	//send start matchmaking to server
	const div = document.createElement("div");

	div.className =
		"container d-flex flex-column justify-content-center align-items-center vh-100 gap-4";

	div.innerHTML = `
		<div>
		</div>
	`;

	const scoreboardEl = Scoreboard(payload.allPlayedGames);

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

	const liveGameTableEl = document.createElement("div");

	liveGameTableEl.innerHTML = `
		<table>
	`;

	const completedGamesTableEl = document.createElement("div");

	// div.appendChild(scoreboardEl);
	div.appendChild(button);

	return {
		element: div,
		updateGameTables: (payload: LobbyUpdatePayload) => {},
	};
}
