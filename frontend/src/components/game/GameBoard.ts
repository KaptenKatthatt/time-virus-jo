import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { Socket } from "socket.io-client";
import { Virus } from "./Virus";

export default function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	console.log("GameBoard rendering");
	const gameBoard = document.createElement("div");

	const handleVirusClick = (virus: HTMLImageElement) => {
		virus.remove();
		//Send player timestamp to server
		sendTimeStamp();
	};

	const setupSocketListeners = () => {
		socket.on("game:virus", (payload) => {
			const virus = Virus(payload.x + 1, payload.y + 1, () => {
				handleVirusClick(virus);
				console.log("Virus clicked");
				console.log("payload-x", payload.x);
				console.log("payload-y", payload.y);
				console.log("payload delay", payload.delay);
			});

			setTimeout(() => {
				gameBoard.appendChild(virus);
			}, payload.delay);
		});
	};

	const sendTimeStamp = () => {
		const timestamp = Date.now();
		if (!socket.id) return;
		const payload = {
			playerId: socket.id,
			timestamp,
		};
		socket.emit("player:clicks", payload);
	};

	const render = () => {
		gameBoard.className = "game-board m-auto border border-5 border-dark";
		setupSocketListeners();
		return gameBoard;
	};
	return render();
}
