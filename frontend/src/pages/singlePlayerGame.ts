import { Virus } from "../components/game/Virus";
import GameBoard from "../components/game/GameBoard";
import { PlayerCard } from "../components/game/PlayerCard";
import { Score } from "../components/game/Score";
import popSound from "../assets/soundfx/pop.mp3";
import type { PlayerCardReturn } from "../types/playerCard.types";
import { GameTimer, restartGameTimer } from "../components/game/GameTimer";
import { GameStatus } from "../components/game/GameStatus";
import type { PlayerPayload } from "../types/game.types";
import type { GameOverPayload } from "@shared/types/payloads.types";
import {
	summonVirusLocal,
	getCpuDelay,
	scheduleCpuClick,
	CPU_PLAYER_ID,
	CPU_PLAYER_NAME,
} from "../lib/cpuPlayer";

const PLAYER_ID = "local-player";

const popAudio = new Audio(popSound);
popAudio.preload = "auto";
popAudio.load();

const playPopSound = () => {
	popAudio.pause();
	popAudio.currentTime = 0;
	void popAudio.play().catch(() => {});
};

export default function SinglePlayerGame(playerName: string, totalRounds = 3) {
	let round = 1;
	let playerScore = 0;
	let cpuScore = 0;
	let spawnTime = 0;
	let roundActive = false;
	let cancelCpu: (() => void) | null = null;

	const playerData: PlayerPayload = { name: playerName, id: PLAYER_ID, score: 0 };
	const cpuData: PlayerPayload = { name: CPU_PLAYER_NAME, id: CPU_PLAYER_ID, score: 0 };

	// Component refs – assigned during render()
	let player1Card: PlayerCardReturn;
	let player2Card: PlayerCardReturn;
	let scoreEl: HTMLDivElement;
	let board: HTMLDivElement;
	let roundNbrEl: HTMLSpanElement;
	let roundTotalEl: HTMLSpanElement;
	let gameTimerEl: HTMLSpanElement;

	const updateScoreDisplay = () => {
		const updated = Score(
			{ ...playerData, score: playerScore },
			{ ...cpuData, score: cpuScore },
			PLAYER_ID,
		);
		scoreEl.innerHTML = updated.innerHTML;
	};

	const endGame = () => {
		GameTimer("stop");
		const payload: GameOverPayload = {
			playerOne: {
				name: playerName,
				score: playerScore,
				isWinner: playerScore > cpuScore,
			},
			playerTwo: {
				name: CPU_PLAYER_NAME,
				score: cpuScore,
				isWinner: cpuScore > playerScore,
			},
		};
		window.dispatchEvent(
			new CustomEvent<GameOverPayload>("app:singlePlayerGameOver", { detail: payload }),
		);
	};

	const advanceRound = () => {
		updateScoreDisplay();
		if (round < totalRounds) {
			round++;
			roundNbrEl.textContent = String(round);
			window.setTimeout(() => startRound(), 600);
		} else {
			window.setTimeout(() => endGame(), 800);
		}
	};

	const explodeAndRemoveVirus = (virus: HTMLDivElement) => {
		virus.style.pointerEvents = "none";
		virus.classList.add("explode");
		window.setTimeout(() => virus.remove(), 1000);
	};

	const startRound = () => {
		roundActive = false;
		GameTimer("stop");

		const virusData = summonVirusLocal();
		const cpuDelay = Math.round(getCpuDelay());

		window.setTimeout(() => {
			spawnTime = Date.now();

			const virus = Virus(virusData.x + 1, virusData.y + 1);
			board.appendChild(virus);
			restartGameTimer(gameTimerEl);
			roundActive = true;

			// Animate CPU cursor and schedule CPU click
			cancelCpu = scheduleCpuClick(
				virus,
				board,
				(cpuReactionTime: number) => {
					if (!roundActive) return;
					roundActive = false;
					cpuScore++;
					player2Card.updateReactionTime(cpuReactionTime);
					explodeAndRemoveVirus(virus);
					advanceRound();
				},
				cpuDelay,
			);

			// Player clicks the virus
			virus.addEventListener(
				"click",
				() => {
					if (!roundActive) return;
					roundActive = false;
					if (cancelCpu) {
						cancelCpu();
						cancelCpu = null;
					}
					playPopSound();
					const reactionTime = Date.now() - spawnTime;
					player1Card.updateReactionTime(reactionTime);
					playerScore++;
					explodeAndRemoveVirus(virus);
					advanceRound();
				},
				{ once: true },
			);
		}, virusData.delay);
	};

	const render = () => {
		const div = document.createElement("div");
		div.className = "game-grid justify-content-center";

		const exitButton = document.createElement("button");
		exitButton.type = "button";
		exitButton.className = "game-exit-button btn border-img-dark-small text-danger";
		exitButton.textContent = "✕";
		exitButton.setAttribute("aria-label", "Exit to lobby");
		exitButton.addEventListener("click", () => {
			if (cancelCpu) cancelCpu();
			GameTimer("stop");
			window.dispatchEvent(new CustomEvent("app:forceLobbyFallback"));
		});

		const aside = document.createElement("aside");
		aside.className = "game-info-panel d-flex flex-xl-column justify-content-evenly";

		const gameStatus = GameStatus();
		gameTimerEl = gameStatus.timerElement;
		roundNbrEl = gameStatus.roundNbrElement;
		roundTotalEl = gameStatus.roundTotalElement;
		roundNbrEl.textContent = String(round);
		roundTotalEl.textContent = String(totalRounds);

		board = GameBoard();

		scoreEl = Score(
			{ ...playerData, score: playerScore },
			{ ...cpuData, score: cpuScore },
			PLAYER_ID,
		);
		player1Card = PlayerCard({ ...playerData }, PLAYER_ID);
		player2Card = PlayerCard({ ...cpuData }, PLAYER_ID);

		gameStatus.element.classList.add("game-info-card");
		scoreEl.classList.add("game-info-card");
		player1Card.element.classList.add("game-info-card");
		player2Card.element.classList.add("game-info-card");

		aside.appendChild(gameStatus.element);
		aside.appendChild(scoreEl);
		aside.appendChild(player1Card.element);
		aside.appendChild(player2Card.element);

		div.appendChild(exitButton);
		div.appendChild(board);
		div.appendChild(aside);

		// Start first round after DOM is painted
		requestAnimationFrame(() => startRound());

		return div;
	};

	return render();
}
