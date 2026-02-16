import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { Socket } from "socket.io-client";

export default function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	console.log("GameBoard rendering");

	const render = () => {
		const gameBoard = document.createElement("div");
		gameBoard.className = "game-board";

		socket.on("game:virus", (payload) => {
			const virus = document.createElement("button");
			virus.className = `virus x${payload.x + 1} y${payload.y + 1}`;
			virus.addEventListener("click", () => {});

			setTimeout(() => {
				gameBoard.appendChild(virus);
			}, payload.delay);
		});

		return gameBoard;
	};

	return render();
}
