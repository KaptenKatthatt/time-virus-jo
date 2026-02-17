import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { Socket } from "socket.io-client";
import { Virus } from "./Virus";

export default function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	console.log("GameBoard rendering");
	const gameBoard = document.createElement("div");

	const handleVirusClick = (virus: HTMLImageElement) => {
		virus.remove();
		//TODO Send player timestamp to server
		//TODO Check if 10 turns
		//TODO YES? Go to GameOver. NO? Start new round
	};

	const setupSocketListeners = () => {
		socket.on("game:virus", (payload) => {
			const virus = Virus(payload.x + 1, payload.y + 1, () => {
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
