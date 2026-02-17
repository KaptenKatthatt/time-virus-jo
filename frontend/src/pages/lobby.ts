import type { Socket } from "socket.io-client";
import Button from "../components/Button";
import Scoreboard from "../components/Scoreboard";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import { WaitingModal } from "../components/LobbyModals";

export let waitingModal: HTMLElement | null = null;

function Lobby(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	// TODO Move logic from button to here

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
			// Send join game request to backend
			if (socket.id) {
				console.log("Sending join request");
				socket.emit("playerJoinGameRequest", socket.id);
			}
			waitingModal = WaitingModal();
			document.body.appendChild(waitingModal);
	
		});

		div.appendChild(scoreboardEl);
		div.appendChild(button);

		return div;
	};

	return render();
}

export default Lobby;
