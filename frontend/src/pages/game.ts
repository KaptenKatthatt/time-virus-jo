import type { GamePayload, ReactionData } from "@shared/types/payloads.types";
import { Virus } from "../components/game/Virus";
import GameBoard from "../components/game/GameBoard";
import { PlayerCard } from "../components/game/PlayerCard";
import { Score } from "../components/game/Score";
import popSound from "../assets/soundfx/pop.mp3";
import type { PlayerCardReturn } from "../types/playerCard.types";
import { GameTimer, restartGameTimer } from "../components/game/GameTimer";
import { GameStatus } from "../components/game/GameStatus";
import { DisconnectedUser } from "../components/LobbyModals";
import type { PlayerPayload } from "../types/game.types";
import type { AppClientSocket } from "../types/socket.types";

const INACTIVITY_TIMEOUT_MS = 60000;
const LOBBY_FALLBACK_TIMEOUT_MS = 1000;
const popAudio = new Audio(popSound);

popAudio.preload = "auto";
popAudio.load();

const playPopSound = () => {
	popAudio.pause();
	popAudio.currentTime = 0;
	void popAudio.play().catch(() => {});
};

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
	let disconnectedModal: HTMLDivElement | null = null;

	const setupGameDataListeners = (
		score: HTMLDivElement,
		roundNbrEl: HTMLSpanElement,
		roundTotalEl: HTMLSpanElement,
	) => {
		socket.off("game:data");
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

				updateRoundTotal(roundTotalEl, payload.totalRounds);
			}
		});
	};

	const handleVirusClick = (virus: HTMLDivElement) => {
		sendReactionTime();
		playPopSound();

		// Block repeat clicks and switch to the explosion animation.
		virus.style.pointerEvents = "none";
		virus.classList.add("explode");

		if (inactivityTimer) {
			clearTimeout(inactivityTimer);
			inactivityTimer = null;
		}

		// Remove virus after the explosion animation completes.
		window.setTimeout(() => {
			virus.remove();
		}, 1000);
	};

	const handleInactivity = () => {
		if (!socket.id) return;
		socket.emit("player:left", { playerId: socket.id });
	};

	const leaveGameWithFallback = () => {
		let hasReturnedToLobby = false;
		const onReturnedToLobby = () => {
			hasReturnedToLobby = true;
			socket.off("player:returnedToLobby", onReturnedToLobby);
		};

		socket.on("player:returnedToLobby", onReturnedToLobby);
		handleInactivity();

		window.setTimeout(() => {
			socket.off("player:returnedToLobby", onReturnedToLobby);

			if (hasReturnedToLobby) {
				return;
			}

			window.dispatchEvent(new CustomEvent("app:forceLobbyFallback"));
		}, LOBBY_FALLBACK_TIMEOUT_MS);
	};

	const setupVirusListeners = (element: HTMLDivElement, gameTimerEl: HTMLSpanElement) => {
		socket.off("game:virus");
		socket.on("game:virus", (payload) => {
			const virus = Virus(payload.x + 1, payload.y + 1, () => {
				handleVirusClick(virus);
			});

			setTimeout(() => {
				spawnTime = Date.now();
				element.appendChild(virus);
				restartGameTimer(gameTimerEl);

				// If player inactive for too long, send to lobby
				inactivityTimer = window.setTimeout(() => {
					handleInactivity();
				}, INACTIVITY_TIMEOUT_MS);
			}, payload.delay);
			GameTimer("stop", gameTimerEl);
		});
	};

	const updateRounbNbr = (element: HTMLSpanElement, roundNbr: number) => {
		element.textContent = String(roundNbr);
	};

	const updateRoundTotal = (element: HTMLSpanElement, totalRounds: number) => {
		element.textContent = String(totalRounds);
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

	socket.off("player:reactionTime");
	socket.on("player:reactionTime", (payload: ReactionData) => {
		if (payload.playerId === player1Data.id) {
			player1Card.updateReactionTime(payload.reactionTime);
		} else if (payload.playerId === player2Data.id) {
			player2Card.updateReactionTime(payload.reactionTime);
		}
	});

	socket.off("player:left");
	socket.on("player:left", (payload: { playerId: string; name: string }) => {
		if (!socket.id || payload.playerId === socket.id) {
			return;
		}

		if (inactivityTimer) {
			clearTimeout(inactivityTimer);
			inactivityTimer = null;
		}

		if (disconnectedModal) {
			disconnectedModal.remove();
		}

		disconnectedModal = DisconnectedUser(payload.name, () => {
			disconnectedModal?.remove();
			leaveGameWithFallback();
		});

		document.body.appendChild(disconnectedModal);
	});

	socket.once("game:over", () => {
		if (inactivityTimer) {
			clearTimeout(inactivityTimer);
			inactivityTimer = null;
		}
	});

	const render = () => {
		const div = document.createElement("div");
		div.className = "game-grid justify-content-center";

		const exitButton = document.createElement("button");
		exitButton.type = "button";
		exitButton.className = "game-exit-button btn border-img-dark-small text-danger";
		exitButton.textContent = "✕";
		exitButton.setAttribute("aria-label", "Tillbaka till lobbyn");
		exitButton.addEventListener("click", leaveGameWithFallback);

		const aside = document.createElement("aside");
		aside.className = "game-info-panel d-flex flex-xl-column justify-content-evenly";

		const gameStatus = GameStatus();
		const gameTimerEl = gameStatus.timerElement;
		const roundNbrEl = gameStatus.roundNbrElement;
		const roundTotalEl = gameStatus.roundTotalElement;

		const board = GameBoard();

		const score = Score(player1Data, player2Data, socket.id!);

		player1Card = PlayerCard(player1Data, socket.id!);
		player2Card = PlayerCard(player2Data, socket.id!);

		gameStatus.element.classList.add("game-info-card");
		score.classList.add("game-info-card");
		player1Card.element.classList.add("game-info-card");
		player2Card.element.classList.add("game-info-card");

		setupVirusListeners(board, gameTimerEl);
		setupGameDataListeners(score, roundNbrEl, roundTotalEl);

		aside.appendChild(gameStatus.element);
		aside.appendChild(score);
		aside.appendChild(player1Card.element);
		aside.appendChild(player2Card.element);

		div.appendChild(exitButton);
		div.appendChild(board);
		div.appendChild(aside);

		return div;
	};

	return render();
}
