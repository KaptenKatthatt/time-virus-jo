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

	// TODO Refactor into SASS classes

	// row i / i+1. For loop i SASS?
	// TODO Receive virus coords and delay

	socket.on("game:virus", (virus) => {
		const virusCell = gameBoard.querySelector<HTMLDivElement>(`#cell-${virus.x}-${virus.y}`)!;

		if (virusCell) {
			virusCell.classList.add("virus");
		}

		virusCell.addEventListener("click", (e) => {
			const clickedCell = e.target as HTMLDivElement;

			// Log to console coords of virus
			if (clickedCell.classList.contains("cell")) {
				console.log(clickedCell.dataset.x, clickedCell.dataset.y);
			}
			if (clickedCell.classList.contains("virus")) {
				clickedCell.classList.remove("virus");
			}
		});
		const currentVirus = gameBoard.querySelector<HTMLDivElement>(".virus");

		if (currentVirus) {
			currentVirus.classList.remove("virus");
		}
	});

	return gameBoard;
}

export default GameBoard;
