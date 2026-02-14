import type { Socket } from "socket.io-client";
import Button from "../components/Button";
import Scoreboard from "../components/scoreboard";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import { GameBoard } from "../components/GameBoard";

function Lobby(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
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
			// Open modal showing "Waiting for opponent..."
		});

		div.appendChild(scoreboardEl);
		div.appendChild(button);

		return div;
	};

	socket.on("game:created", (payload) => {
		console.log(payload.message);
	});
	socket.on("game:start", (payload) => {
		console.log(payload.message);
		GameBoard(socket, payload.gameId);
	});
	return render();
}

export default Lobby;
