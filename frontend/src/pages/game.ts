import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { GamePayload } from "@shared/types/payloads.types";
import { Virus } from "../components/game/Virus";

interface PlayerPayload {
	name: string;
	id: string;
	score: number;
}

export default function Game(
	socket: Socket<ServerToClientEvents, ClientToServerEvents>,
	// gameId: GameId = "",
) {
	const player1 = {
		name: "Player 1",
		id: "id1",
		score: 0,
	};
	const player2 = {
		name: "Player 2",
		id: "id2",
		score: 0,
	};

	// TODO: subscribe to socket events to keep UI (scores, time, round) in sync

	const setupSocketListeners = (
		score: HTMLDivElement,
		playerOne: HTMLDivElement,
		playerTwo: HTMLDivElement,
	) => {
		socket.on("game:data", (payload: GamePayload | GamePayload[]) => {
			if (!Array.isArray(payload)) {
				const players: {
					player1: PlayerPayload;
					player2: PlayerPayload;
				} = {
					player1: {
						name: payload.player_one_name ?? "Player 1",
						id: payload.player_one_id ?? "",
						score: payload.player_one_score ?? 0,
					},
					player2: {
						name: payload.player_two_name ?? "Player 2",
						id: payload.player_two_id ?? "",
						score: payload.player_two_score ?? 0,
					},
				};

				const updatedScore = Score(
					players.player1.score,
					players.player2.score,
					socket.id!,
				);
				score.innerHTML = updatedScore.innerHTML;

				const updatedPlayerOne = PlayerScore(players.player1, socket.id!);
				playerOne.innerHTML = updatedPlayerOne.innerHTML;

				const updatedPlayerTwo = PlayerScore(players.player2, socket.id!);
				playerTwo.innerHTML = updatedPlayerTwo.innerHTML;
			}
		});
	};

	const render = () => {
		const div = document.createElement("div");
		div.className = "game-grid justify-content-center gap-4 align-items-between h-100";

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
		const score = Score(player1.score, player2.score, socket.id!);
		const playerOne = PlayerScore(player1, socket.id!);
		const playerTwo = PlayerScore(player2, socket.id!);

		setupSocketListeners(score, playerOne, playerTwo);

		aside.appendChild(title);
		aside.appendChild(score);
		aside.appendChild(playerOne);
		aside.appendChild(playerTwo);

		div.appendChild(board);
		div.appendChild(aside);

		return div;
	};

	return render();
}

function Score(scoreOne: number, scoreTwo: number, socketId: string) {
	const render = () => {
		const div = document.createElement("div");
		const playerId = socketId;
		const isMe = socketId === playerId ? "text-primary" : "";

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		div.innerHTML = `
			<span class="${isMe}">${scoreOne}</span>
			<span>-</span>
			<span>${scoreTwo}</span>
		`;

		return div;
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
} // TODO Present player click time in aside on both players
// TODO Present Round start time in that div. Start when game start. Stops and resets when both players clicked.

export default function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	let spawnTime = 0;
	let inactivityTimer: number | null = null;

	const handleVirusClick = (virus: HTMLImageElement) => {
		virus.remove();

		//Stop inactivity timer
		if (inactivityTimer) {
			clearTimeout(inactivityTimer);
			inactivityTimer = null;
			console.log("Cleared inactivity");
		}

		sendReactionTime();
	};

	const setupSocketListeners = (element: HTMLDivElement) => {
		socket.on("game:virus", (payload) => {
			const virus = Virus(payload.x + 1, payload.y + 1, () => {
				handleVirusClick(virus);
				// console.log("Virus clicked");
				// console.log("payload-x", payload.x);
				// console.log("payload-y", payload.y);
				// console.log("payload delay", payload.delay);
			});

			setTimeout(() => {
				spawnTime = Date.now();
				element.appendChild(virus);
				console.log("virus spawned inactivity timer started");

				inactivityTimer = window.setTimeout(() => {
					console.log("Player inactive - returning to login");
					window.location.reload();
				}, 30000);
			}, payload.delay);
		});
	};

	const sendReactionTime = () => {
		const clickTime = Date.now();
		const reactionTime = clickTime - spawnTime;
		if (!socket.id) return;
		const payload = {
			playerId: socket.id,
			timestamp: reactionTime,
		};
		socket.emit("player:clicked", payload);
	};

	const render = () => {
		const gameBoard = document.createElement("div");

		gameBoard.className = "game-board m-auto border-img-dark";

		setupSocketListeners(gameBoard);

		return gameBoard;
	};
	return render();
}
