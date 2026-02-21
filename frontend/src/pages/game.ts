import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { GamePayload } from "@shared/types/payloads.types";
import { Virus } from "../components/game/Virus";
import GameBoard from "../components/game/GameBoard";

interface PlayerPayload {
	name: string;
	id: string;
	score: number;
}

interface PlayerScoreReturn {
	element: HTMLDivElement;
	updateReactionTime: (reactionTime: number) => void;
	updateName: (name: string) => void;
}

const padZero = (num: number) => {
	return num.toString().padStart(2, "0");
};
const timeFormatter = (time: number) => {
	const seconds = Math.floor(time / 1000);
	const hundredths = Math.floor((time % 1000) / 10);
	return `${padZero(seconds)}:${padZero(hundredths)}`;
};

export default function Game(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
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

	let playerOne: PlayerScoreReturn;
	let playerTwo: PlayerScoreReturn;

	const setupGameDataListeners = (score: HTMLDivElement) => {
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

				player1.id = players.player1.id;
				player1.name = players.player1.name;
				player1.score = players.player1.score;

				player2.id = players.player2.id;
				player2.name = players.player2.name;
				player2.score = players.player2.score;

				const updatedScore = Score(players.player1, players.player2, socket.id!);
				score.innerHTML = updatedScore.innerHTML;

				playerOne.updateName(player1.name);
				playerTwo.updateName(player2.name);
			}
		});
	};

	let spawnTime = 0;
	let inactivityTimer: number | null = null;

	const handleVirusClick = (virus: HTMLImageElement) => {
		console.log("Virus clicked");
		virus.remove();

		if (inactivityTimer) {
			clearTimeout(inactivityTimer);
			inactivityTimer = null;
			console.log("Cleared inactivity timer");
		}

		sendReactionTime();
	};

	const setupVirusListeners = (element: HTMLDivElement, gameTimerEl: HTMLSpanElement) => {
		console.log("setupVirusListeners called");
		socket.on("game:virus", (payload) => {
			console.log("game:virus event received");
			const virus = Virus(payload.x + 1, payload.y + 1, () => {
				handleVirusClick(virus);
			});

			setTimeout(() => {
				spawnTime = Date.now();
				element.appendChild(virus);
				restartGameTimer(gameTimerEl);
				console.log("virus spawned, inactivity timer started");

				inactivityTimer = window.setTimeout(() => {
					console.log("Player inactive - returning to login");
					window.location.reload();
				}, 30000);
			}, payload.delay);
			gameTimer("stop", gameTimerEl);
		});
	};

	let gameTime = 0;
	const gameTimer = (startOrStop: string, gameTimerEl?: HTMLSpanElement) => {
		const startTime = performance.now();
		const updateInterval = 100;

		if (startOrStop === "start") {
			let elapsed = 0;

			gameTime = setInterval(() => {
				elapsed = performance.now() - startTime;
				if (gameTimerEl instanceof HTMLSpanElement) {
					gameTimerEl.textContent = timeFormatter(elapsed);
				}
			}, updateInterval);
		} else if (startOrStop === "stop") {
			clearInterval(gameTime);
		}
	};

	const restartGameTimer = (gameTimerEl: HTMLSpanElement) => {
		gameTimer("stop");
		gameTimer("start", gameTimerEl);
	};

	const sendReactionTime = () => {
		const clickTime = Date.now();
		if (spawnTime === 0) {
			console.error("spawnTime is not set.");
			return;
		}
		const reactionTime = clickTime - spawnTime;
		if (!socket.id) return;
		const payload = {
			playerId: socket.id,
			timestamp: reactionTime,
		};
		socket.emit("player:clicked", payload);

		if (socket.id === player1.id) {
			playerOne.updateReactionTime(reactionTime);
		} else if (socket.id === player2.id) {
			playerTwo.updateReactionTime(reactionTime);
		}
	};

	const render = () => {
		// const gameTime = "00:00";

		const div = document.createElement("div");
		div.className = "game-grid justify-content-center gap-4 align-items-between h-100";

		const aside = document.createElement("aside");
		aside.className = "d-flex flex-xl-column gap-4 justify-content-evenly p-5";

		const title = document.createElement("div");
		title.className =
			"title-span p-4 d-flex bg-dark flex-column justify-content-center align-items-center border-img-dark";

		title.innerHTML = `
			<span class="gametimeDisplay display-2 font-monospace">${gameTime}</span>
			<span class="round display-5">3
				<span class="round-slash fs-4">/</span>
				<span class="round-total display-6">10</span>
			</span>
		`;

		const gameTimerEl: HTMLSpanElement = title.querySelector(".gametimeDisplay")!;

		const board = GameBoard();

		const score = Score(player1, player2, socket.id!);
		playerOne = PlayerScore(player1, socket.id!);
		playerTwo = PlayerScore(player2, socket.id!);

		setupGameDataListeners(score);
		setupVirusListeners(board, gameTimerEl);

		aside.appendChild(title);
		aside.appendChild(score);
		aside.appendChild(playerOne.element);
		aside.appendChild(playerTwo.element);

		div.appendChild(board);
		div.appendChild(aside);

		return div;
	};

	return render();
}

function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const render = () => {
		const div = document.createElement("div");
		const isMe = socketId === playerOne.id ? "text-primary" : "";
		const isPlayerTwo = socketId === playerTwo.id ? "text-primary" : "";

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		div.innerHTML = `
			<span class="${isMe}">${playerOne.score}</span>
			<span>-</span>
			<span class="${isPlayerTwo}">${playerTwo.score}</span>
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
			<span class="name ${isMe} display-lg-5 display-6">${name}</span>
			<span class="player-reaction-time fs-2">00:00</span>
		`;
		const reactionTimeEl = div.querySelector<HTMLSpanElement>(".player-reaction-time")!;

		const playerNameEl = div.querySelector<HTMLDivElement>(".name")!;

		return {
			element: div,
			updateReactionTime: (reactionTime: number) => {
				// const seconds = Math.floor(reactionTime / 1000);
				// const hundredths = Math.floor((reactionTime % 1000) / 10);
				// const reactionTimeFormatted = `${padZero(seconds)}:${padZero(hundredths)}`;

				reactionTimeEl.textContent = timeFormatter(reactionTime);
			},
			updateName: (name: string) => {
				playerNameEl.textContent = name;
			},
		};
	};
	return render();
}
