import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { GamePayload, ReactionData } from "@shared/types/payloads.types";
import { Virus } from "../components/game/Virus";
import GameBoard from "../components/game/GameBoard";
import { PlayerCard } from "../components/game/PlayerCard";
import { Score } from "../components/game/Score";
import type { PlayerCardReturn } from "../types/playerCard.types";
import { GameTimer, restartGameTimer } from "../components/game/GameTimer";
import { GameStatus } from "../components/game/GameStatus";

export default function Game(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	let player1 = {
		name: "Player 1",
		id: "id1",
		score: 0,
	};
	let player2 = {
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
			if (!Array.isArray(payload)) {
				player1 = {
					name: payload.player_one_name ?? "Player 1",
					id: payload.player_one_id ?? "",
					score: payload.player_one_score ?? 0,
				};
				player2 = {
					name: payload.player_two_name ?? "Player 2",
					id: payload.player_two_id ?? "",
					score: payload.player_two_score ?? 0,
				};

				//Update player info
				playerOne.updateName(player1.name);
				playerTwo.updateName(player2.name);

				playerOne.updatePlayerId(player1.id);
				playerTwo.updatePlayerId(player2.id);

				const updatedScore = Score(player1, player2, socket.id!);
				score.innerHTML = updatedScore.innerHTML;

				// Update round nbr
				if (payload.round) {
					updateRounbNbr(roundNbrEl, payload.round);
				} else {
					console.error("roundnbr empty", payload.round);
				}
			}
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
	};

	socket.on("player:reactionTime", (payload: ReactionData) => {
		if (payload.playerId === player1.id) {
			playerOne.updateReactionTime(payload.reactionTime);
		} else if (payload.playerId === player2.id) {
			playerTwo.updateReactionTime(payload.reactionTime);
		}
	});

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
