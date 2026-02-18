import type { Socket } from "socket.io-client";
import GameBoard from "../components/game/GameBoard";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";

interface PlayerPayload {
	name: string;
	id: string;
	score: number;
}

export default function Game(
	socket: Socket<ServerToClientEvents, ClientToServerEvents>,
	gameId: GameId = "",
) {
	// TODO: subscribe to socket events to keep UI (scores, time, round) in sync
	const player1 = {
		name: "Player 1",
		id: "id1",
		score: 3,
	};
	const player2 = {
		name: "Player 2",
		id: "id2",
		score: 4,
	};

	const render = () => {
		const root = document.createElement("div");
		root.className = "game-grid justify-content-center gap-4 align-items-between h-100";

		const aside = document.createElement("aside");
		aside.className = "d-flex flex-xl-column gap-4 justify-content-evenly p-5";

		const title = document.createElement("div");
		title.className =
			"title-span p-4 d-flex bg-dark flex-column justify-content-center align-items-center border-img-dark";
		title.innerHTML = `
			<span class="time display-2">00:00</span>
			<span class="round display-5">3
				<span class="round-slash fs-4">/</span>
				<span class="round-total display-6">10</span>
			</span>
		`;

		const board = GameBoard(socket);

		// Score / header row
		const row = document.createElement("div");
		row.className = "gameboard-grid";

		const score = Score(player1.score, player2.score);
		const playerOne = PlayerScore(player1, "id1");
		const playerTwo = PlayerScore(player2, "id1");

		aside.appendChild(title);
		aside.appendChild(score);
		aside.appendChild(playerOne);
		aside.appendChild(playerTwo);

		root.appendChild(board);
		root.appendChild(aside);

		return root;
	};

	return render();
}

function Score(scoreOne: number, scoreTwo: number) {
	const render = () => {
		const root = document.createElement("div");
		root.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		root.innerHTML = `
			<span >${scoreOne}</span>
			<span>-</span>
			<span>${scoreTwo}</span>
		`;

		return root;
	};
	return render();
}

function PlayerScore(player: PlayerPayload, socketId: string) {
	const playerId = player.id;
	const name = player.name;

	const render = () => {
		const div = document.createElement("div");
		const isMe = socketId === playerId ? "text-primary" : "";

		div.className =
			"d-flex justify-content-evenly flex-column bg-dark align-items-center p-4 border-img-dark";

		div.innerHTML = `
			<span class="${isMe} display-lg-5 display-6">${name}</span>
			<span class="fs-2">00:00</span>
		`;

		return div;
	};
	return render();
}
