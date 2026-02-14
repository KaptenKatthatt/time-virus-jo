import type { GameId } from "@shared/types/payloads.types";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { Socket } from "socket.io-client";

function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>, gameId: GameId) {
	const gameBoard = document.createElement("div");
	gameBoard.className = "game-board";
	console.log("GameBoard rendering");

	// Generate squares with two loops
	for (let x = 0; x <= 9; x++) {
		for (let y = 0; y <= 9; y++) {
			const cell = document.createElement("div");
			cell.classList.add("cell");
			cell.dataset.x = String(x);
			cell.dataset.y = String(y);
			cell.id = `cell-${x}-${y}`;
			gameBoard.appendChild(cell);
		}
	}
	gameBoard.addEventListener("click", (e) => {
		const clickedCell = e.target as HTMLElement;

		// Log to console coords of virus
		if (clickedCell.classList.contains("cell")) {
			console.log(clickedCell.dataset.x, clickedCell.dataset.y);
		}
		if (clickedCell.classList.contains("virus")) {
			clickedCell.classList.remove("virus");

			// Update score
			// score++;
			// playerOneScore.textContent = String(score);

			// payload:
			// PlayerNbr 1 clicked first? true/false
			// Player1time
			// Player Nbr 2 clicked first? true/false
			// player2Time
			// Player name
			// Game id

			//TODO: Receive game start timestamp from server

			// TODO: Emit timestamp
			// const timestamp = Date.now();
			// const currentPlayer = "someUser";

			// const timeStampPayload = {
			// 	userId: currentPlayer,
			// 	timestamp,
			// };
			// socket.emit("sendTimestamp", timeStampPayload);

			// TODO: Receive new score and update UI

			// socket.emit("updateScore", payload);
		}
	});

	// const playerOneScore = document.querySelector<HTMLSpanElement>(".player-1-score")!;
	// // playerOneScore.textContent = String(score);

	setInterval(() => {
		const currentVirus = gameBoard.querySelector(".virus") as HTMLElement | null;
		if (currentVirus) {
			currentVirus.classList.remove("virus");
		}
		const randX = Math.floor(Math.random() * 10);
		const randY = Math.floor(Math.random() * 10);
		const virusCell = gameBoard.querySelector(`#cell-${randX}-${randY}`) as HTMLElement | null;
		if (virusCell) {
			virusCell.classList.add("virus");
		}
	}, 2000);

	return gameBoard;
}

export default GameBoard;
