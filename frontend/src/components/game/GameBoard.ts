import type { GameId, VirusPayload } from "@shared/types/payloads.types";
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

	// TODO Receive virus coords and delay
	socket.on("game:sendVirus", (virus: VirusPayload) => {});

	gameBoard.addEventListener("click", (e) => {
		const clickedCell = e.target as HTMLElement;

		// Log to console coords of virus
		if (clickedCell.classList.contains("cell")) {
			console.log(clickedCell.dataset.x, clickedCell.dataset.y);
		}
		if (clickedCell.classList.contains("virus")) {
			clickedCell.classList.remove("virus");
		}
	});
	const currentVirus = gameBoard.querySelector(".virus") as HTMLElement | null;
	if (currentVirus) {
		currentVirus.classList.remove("virus");
	}
	const virusCell = gameBoard.querySelector(`#cell-${randX}-${randY}`) as HTMLElement | null;
	if (virusCell) {
		virusCell.classList.add("virus");
	}

	return gameBoard;
}

export default GameBoard;
