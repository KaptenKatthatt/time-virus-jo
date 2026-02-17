import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { Socket } from "socket.io-client";

export default function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	console.log("GameBoard rendering");
	const gameBoard = document.createElement("div");

	const handleVirusClick = (virus: HTMLButtonElement) => {
		virus.remove();
		//TODO Send player timestamp to server
		//TODO Check if 10 turns
		//TODO YES? Go to GameOver. NO? Start new round
	};

	const setupSocketListeners = () => {
		socket.on("game:virus", (payload) => {
			const virus = document.createElement("button");
			virus.className = `virus x${payload.x + 1} y${payload.y + 1}`;

			virus.addEventListener("click", () => {
				handleVirusClick(virus);
			});

			setTimeout(() => {
				gameBoard.appendChild(virus);
			}, payload.delay);
		});
	};

	const render = () => {
		gameBoard.className = "game-board";
		setupSocketListeners();
		return gameBoard;
	};
	return render();
}
