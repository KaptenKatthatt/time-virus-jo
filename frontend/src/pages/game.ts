import type { Socket } from "socket.io-client";
import GameBoard from "../components/game/GameBoard";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { GamePayload } from "@shared/types/payloads.types";
import PlayerData from "../components/game/PlayerData";

// interface PlayerPayload {
// 	name: string;
// 	id: string;
// 	score: number;
// }

/**
 * Game page with score and gameboard
 * @param socket
 */
export default function Game(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	// Static containers
	const container = document.createElement("div");
	const row = document.createElement("div");

	// Time and round container
	const timeCol = document.createElement("div");
	timeCol.className = "col-auto  d-flex flex-row align-items-center";
	const roundHeadingEl = document.createElement("span");
	roundHeadingEl.className = "display-4";
	roundHeadingEl.innerText = "Round";
	const roundValueEl = document.createElement("span");
	roundValueEl.className = "display-4";
	const roundSlashEl = document.createElement("span");
	roundSlashEl.innerText = "/";
	const totalRoundsEl = document.createElement("span");
	totalRoundsEl.innerText = "3";
	totalRoundsEl.className = "display-6";

	// Dynamic containers
	const p1 = PlayerData("P1", 0);
	const p2 = PlayerData("P2", 0);

	// Aside
	const aside = document.createElement("aside");
	aside.className = "d-flex flex-xl-column gap-4 justify-content-evenly p-5";

	const game = document.createElement("div");

	const title = document.createElement("div");

	// TODO: Update UI at gamestart, not after first round

	//TODO Refactor GamePayload into GameUpdate that contains only score update and round nbr
	// Gamepayload can be complete game info

	//TODO Add total rounds to payload.

	//TODO Put best player time where timecol is, roundnbr and time in Title

	socket.on("game:data", (payload: GamePayload | GamePayload[]) => {
		if (!Array.isArray(payload)) {
			const {
				player_one_name,
				player_two_name,
				player_one_score,
				player_two_score,
				// player_one_id,
				// player_two_id,
				round,
				fastest_player_id,
				fastest_Time,
			} = payload;

			p1.update(player_one_name, player_one_score);
			p2.update(player_two_name, player_two_score);
			roundValueEl.innerText = String(round);
		}
	});

	const render = () => {
		container.className = "game-grid justify-content-center gap-4 align-items-between h-100";

		// Score / header row
		row.className = "row score-row justify-content-between";
		// row.className = "gameboard-grid";

		game.className =
			"game-container container d-flex flex-column justify-content-around vh-100";

		timeCol.append(roundHeadingEl, roundValueEl, roundSlashEl, totalRoundsEl);

		title.className =
			"title-span p-4 d-flex bg-dark flex-column justify-content-center align-items-center border-img-dark";
		title.innerHTML = `
			<span class="time display-2">00:00</span>
			<span class="round display-5">3
				<span class="round-slash fs-4">/</span>
				<span class="round-total display-6">3</span>
			</span>
		`;

		// const score = Score(player1.score, player2.score);
		// const playerOne = PlayerScore(player1, "id1");
		// const playerTwo = PlayerScore(player2, "id1");

		aside.appendChild(title);
		// aside.appendChild(score);
		// aside.appendChild(playerOne);
		// aside.appendChild(playerTwo);
		// row.appendChild(playerOneEl);
		// row.appendChild(timeCol);
		// row.appendChild(playerTwoEl);

		row.append(p1.element, timeCol, p2.element);

		container.appendChild(aside);

		container.appendChild(row);

		const board = GameBoard(socket);
		container.appendChild(board);
		return container;
	};

	return render();
}

// function Score(scoreOne: number, scoreTwo: number) {
// 	const render = () => {
// 		container.className =
// 			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

// 		container.innerHTML = `
// 			<span >${scoreOne}</span>
// 			<span>-</span>
// 			<span>${scoreTwo}</span>
// 		`;

// 		return container;
// 	};
// 	return render();
// }

// function PlayerScore(player: PlayerPayload, socketId: string) {
// 	const playerId = player.id;
// 	const name = player.name;

// 	const render = () => {
// 		const div = document.createElement("div");
// 		const isMe = socketId === playerId ? "text-primary" : "";

// 		div.className =
// 			"d-flex justify-content-evenly flex-column bg-dark align-items-center p-4 border-img-dark";

// 		div.innerHTML = `
// 			<span class="${isMe} display-lg-5 display-6">${name}</span>
// 			<span class="fs-2">00:00</span>
// 		`;

// 		return div;
// };
// 	return render();
// }
