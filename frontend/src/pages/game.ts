import type { Socket } from "socket.io-client";
import PlayerData from "../components/game/PlayerData";
import GameBoard from "../components/GameBoard";
import type { GameId } from "@shared/types/payloads.types";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";

export default function Game(
	socket: Socket<ServerToClientEvents, ClientToServerEvents>,
	gameId: GameId = "",
) {
	// TODO: subscribe to socket events to keep UI (scores, time, rounds) in sync

	const render = () => {
		const root = document.createElement("div");
		root.className =
			"game-container container d-flex flex-column justify-content-around vh-100";

		// Score / header row
		const row = document.createElement("div");
		row.className = "row score-row justify-content-between";

		const playerOneEl = PlayerData("Player 1", 1, 8, 1.37);

		const timeCol = document.createElement("div");
		timeCol.className = "col-auto time-rounds d-flex flex-column align-items-center";
		timeCol.innerHTML = `
			<span class="time display-1">00:00</span>
			<span class="rounds-heading">Round</span>
			<span class="rounds display-3">3
				<span class="round-slash fs-4">/</span>
				<span class="rounds-total display-6">10</span>
			</span>
		`;

		const playerTwoEl = PlayerData("Player 2", 2, 3, 1.37);

		row.appendChild(playerOneEl);
		row.appendChild(timeCol);
		row.appendChild(playerTwoEl);

		root.appendChild(row);

		const board = GameBoard(socket, gameId);
		root.appendChild(board);

		return root;
	};

	return render();
}
