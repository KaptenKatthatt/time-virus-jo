// import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
// import type { Socket } from "socket.io-client";
// import { Virus } from "./Virus";

// TODO Present player click time in aside on both players
// TODO Present Round start time in that div. Start when game start. Stops and resets when both players clicked.

export default function GameBoard() {
	// export default function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	// let spawnTime = 0;
	// let inactivityTimer: number | null = null;

	// const handleVirusClick = (virus: HTMLImageElement) => {
	// 	virus.remove();

	// 	//Stop inactivity timer
	// 	if (inactivityTimer) {
	// 		clearTimeout(inactivityTimer);
	// 		inactivityTimer = null;
	// 		console.log("Cleared inactivity");
	// 	}

	// 	sendReactionTime();
	// };

	// const setupSocketListeners = (element: HTMLDivElement) => {
	// 	socket.on("game:virus", (payload) => {
	// 		const virus = Virus(payload.x + 1, payload.y + 1, () => {
	// 			handleVirusClick(virus);
	// 			// console.log("Virus clicked");
	// 			// console.log("payload-x", payload.x);
	// 			// console.log("payload-y", payload.y);
	// 			// console.log("payload delay", payload.delay);
	// 		});

	// 		setTimeout(() => {
	// 			spawnTime = Date.now();
	// 			element.appendChild(virus);
	// 			console.log("virus spawned inactivity timer started");

	// 			inactivityTimer = window.setTimeout(() => {
	// 				console.log("Player inactive - returning to login");
	// 				window.location.reload();
	// 			}, 30000);
	// 		}, payload.delay);
	// 	});
	// };

	// const sendReactionTime = () => {
	// 	const clickTime = Date.now();
	// 	const reactionTime = clickTime - spawnTime;
	// 	if (!socket.id) return;
	// 	const payload = {
	// 		playerId: socket.id,
	// 		timestamp: reactionTime,
	// 	};
	// 	socket.emit("player:clicked", payload);
	// };

	const render = () => {
		const gameBoard = document.createElement("div");

		gameBoard.className = "game-board m-auto border-img-dark";

		// setupSocketListeners(gameBoard);

		return gameBoard;
	};
	return render();
}
