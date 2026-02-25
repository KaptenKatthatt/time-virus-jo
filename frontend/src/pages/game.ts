import type { GamePayload, ReactionData } from "@shared/types/payloads.types";
import { Virus } from "../components/game/Virus";
import GameBoard from "../components/game/GameBoard";
import { PlayerCard } from "../components/game/PlayerCard";
import { Score } from "../components/game/Score";
import type { PlayerCardReturn } from "../types/playerCard.types";
import { GameTimer, restartGameTimer } from "../components/game/GameTimer";
import { GameStatus } from "../components/game/GameStatus";
import type { PlayerPayload } from "../types/game.types";
import type { AppClientSocket } from "../types/socket.types";

export default function Game(socket: AppClientSocket) {
	let player1Data: PlayerPayload = {
		name: "Player 1",
		id: "id1",
		score: 0,
	};
	let player2Data: PlayerPayload = {
		name: "Player 2",
		id: "id2",
		score: 0,
	};

	//Inits
	let player1Card: PlayerCardReturn;
	let player2Card: PlayerCardReturn;
	let spawnTime = 0;
	let inactivityTimer: number | null = null;

	const setupGameDataListeners = (score: HTMLDivElement, roundNbrEl: HTMLSpanElement) => {
		socket.on("game:data", (payload: GamePayload | GamePayload[]) => {
			if (!Array.isArray(payload)) {
				player1Data = {
					name: payload.player_one_name ?? "Player 1",
					id: payload.player_one_id ?? "",
					score: payload.player_one_score ?? 0,
				};
				player2Data = {
					name: payload.player_two_name ?? "Player 2",
					id: payload.player_two_id ?? "",
					score: payload.player_two_score ?? 0,
				};

				//Update player info
				player1Card.updateName(player1Data.name);
				player2Card.updateName(player2Data.name);

				player1Card.updatePlayerId(player1Data.id);
				player2Card.updatePlayerId(player2Data.id);

				const updatedScore = Score(player1Data, player2Data, socket.id!);
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
		virus.remove();

		if (inactivityTimer) {
			clearTimeout(inactivityTimer);
			inactivityTimer = null;
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

				inactivityTimer = window.setTimeout(() => {
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
		if (payload.playerId === player1Data.id) {
			player1Card.updateReactionTime(payload.reactionTime);
		} else if (payload.playerId === player2Data.id) {
			player2Card.updateReactionTime(payload.reactionTime);
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

		const score = Score(player1Data, player2Data, socket.id!);

		player1Card = PlayerCard(player1Data, socket.id!);
		player2Card = PlayerCard(player2Data, socket.id!);

		setupVirusListeners(board, gameTimerEl);
		setupGameDataListeners(score, roundNbrEl);

		aside.appendChild(gameStatus.element);
		aside.appendChild(score);
		aside.appendChild(player1Card.element);
		aside.appendChild(player2Card.element);

		div.appendChild(board);
		div.appendChild(aside);

		return div;
	};

	return render();
}
