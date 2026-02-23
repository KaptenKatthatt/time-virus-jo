import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { GamePayload } from "@shared/types/payloads.types";
import { Virus } from "../components/game/Virus";
import GameBoard from "../components/game/GameBoard";
import { PlayerCard } from "../components/game/PlayerCard";
import { Score } from "../components/game/Score";
import type { PlayerCardReturn } from "../types/playerCard.types";
import type { PlayerPayload } from "../types/game.types";
import { GameTimer, restartGameTimer } from "../components/game/GameTimer";
import { GameStatus } from "../components/game/GameStatus";

export default function Game(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	console.log("Game() called");

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

	//Inits
	let playerOne: PlayerCardReturn;
	let playerTwo: PlayerCardReturn;
	let spawnTime = 0;
	let inactivityTimer: number | null = null;

	const setupGameDataListeners = (score: HTMLDivElement, roundNbrEl: HTMLSpanElement) => {
		socket.on("game:data", (payload: GamePayload | GamePayload[]) => {
			console.log("Längst upp i setupGameDataListers");

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

				//Update player info
				playerOne.updateName(player1.name);
				playerTwo.updateName(player2.name);

				playerOne.updatePlayerId(player1.id);
				playerTwo.updatePlayerId(player2.id);

				const updatedScore = Score(players.player1, players.player2, socket.id!);
				score.innerHTML = updatedScore.innerHTML;

				// Update round nbr
				if (payload.round) {
					updateRounbNbr(roundNbrEl, payload.round);
				} else {
					console.log("roundnbr empty", payload.round);
				}
			}
			console.log("game:data received", payload);
		});
	};

	const handleVirusClick = (virus: HTMLImageElement) => {
		sendReactionTime();
		console.log("Virus clicked");
		virus.remove();

		if (inactivityTimer) {
			clearTimeout(inactivityTimer);
			inactivityTimer = null;
			console.log("Cleared inactivity timer");
		}
	};

	const setupVirusListeners = (element: HTMLDivElement, gameTimerEl: HTMLSpanElement) => {
		socket.on("game:virus", (payload) => {
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
			GameTimer("stop", gameTimerEl);
		});
	};

	const updateRounbNbr = (element: HTMLSpanElement, roundNbr: number) => {
		element.textContent = String(roundNbr);
	};

	const sendReactionTime = () => {
		console.log("sendReactionTime socket.id", socket.id);
		console.log("sendReactionTime p1id", player1.id);
		console.log("sendReactionTime p2id", player2.id);

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
		if (socket.id === player1.id) {
			playerOne.updateReactionTime(reactionTime);
		} else if (socket.id === player2.id) {
			playerTwo.updateReactionTime(reactionTime);
		}
		console.log("Reaction time", reactionTime);
		socket.emit("player:clicked", payload);
	};

	const render = () => {
		const div = document.createElement("div");
		div.className = "game-grid justify-content-center gap-4 align-items-between h-100";

		const aside = document.createElement("aside");
		aside.className = "d-flex flex-xl-column gap-4 justify-content-evenly p-5";

		const gameStatus = GameStatus();
		const gameTimerEl = gameStatus.timerElement;
		const roundNbrEl = gameStatus.roundNbrElement;

		const board = GameBoard();

		const score = Score(player1, player2, socket.id!);

		playerOne = PlayerCard(player1, socket.id!);
		playerTwo = PlayerCard(player2, socket.id!);

		setupVirusListeners(board, gameTimerEl);
		setupGameDataListeners(score, roundNbrEl);

		aside.appendChild(gameStatus.element);
		aside.appendChild(score);
		aside.appendChild(playerOne.element);
		aside.appendChild(playerTwo.element);

		div.appendChild(board);
		div.appendChild(aside);

		return div;
	};

	return render();
}
