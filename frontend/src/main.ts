import { io } from "socket.io-client";

// Styling
import "./assets/scss/style.scss";
import "./assets/scss/game.scss";

// Types
import type { Player } from "../../backend/generated/prisma/client";

// Pages
import Lobby, { waitingModal } from "./pages/lobby";
import Game from "./pages/game";
import SinglePlayerGame from "./pages/singlePlayerGame";
import { InputPlayerName } from "./components/InputPlayerName";
import GameOver from "./pages/gameover";
import {
	DisconnectedUser,
	MatchFoundModal,
	SelectRoundsModal,
	WaitingForRoundSelectionModal,
} from "./components/LobbyModals";
import type {
	GameOverPayload,
	LobbyUpdatePayload,
	PlayerDisconnectedPayload,
} from "@shared/types/payloads.types";
import type { AppClientSocket } from "./types/socket.types";
import { APP_FADE_DURATION_MS, applyFadeDurationCssVar } from "./lib/fadeConfig";
import { escapeHtml } from "./utils/sanitize";

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("🙇 Connecting to Socket.IO Server at:", SOCKET_HOST);

// Connect to Socket.IO Server
const socket: AppClientSocket = io(SOCKET_HOST);

/**
 * DOM References
 */
const app = document.querySelector<HTMLDivElement>("#app")!;

/**
 * Variables
 */
let currentPlayer: Player | undefined = undefined;
let lobbyInstance: ReturnType<typeof Lobby> | null = null;
let latestLobbyData: LobbyUpdatePayload | null = null;
let roundSelectionModal: HTMLElement | null = null;
let selectedSinglePlayerRounds = 3;
let queuedScreenTransition: Promise<void> = Promise.resolve();

applyFadeDurationCssVar();

const wait = (ms: number) =>
	new Promise<void>((resolve) => {
		window.setTimeout(resolve, ms);
	});

const nextAnimationFrame = () =>
	new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			resolve();
		});
	});

const replaceAppContent = (nextScreen: HTMLElement) => {
	app.innerHTML = "";
	app.appendChild(nextScreen);
};

const withScreenFade = (nextScreen: HTMLElement) => {
	queuedScreenTransition = queuedScreenTransition
		.catch(() => undefined)
		.then(async () => {
			const overlay = document.createElement("div");
			overlay.className = "app-screen-fade-overlay";
			document.body.appendChild(overlay);

			try {
				await nextAnimationFrame();
				overlay.classList.add("is-visible");

				await wait(APP_FADE_DURATION_MS);
				replaceAppContent(nextScreen);
			} finally {
				if (overlay.isConnected) {
					await nextAnimationFrame();
					overlay.classList.remove("is-visible");

					await wait(APP_FADE_DURATION_MS);
					overlay.remove();
				}
			}
		});

	return queuedScreenTransition;
};

/**
 * Socket Event Listeners
 */

// Listen for when a connection is established
const playerName = InputPlayerName(socket);
socket.on("connect", () => {
	console.log("💥 Connected to server", socket.io.opts.hostname + ":" + socket.io.opts.port);
	console.log("🔗 Socket ID:", socket.id);

	app.appendChild(playerName);
});

// Listen for when the server gets tired of us
socket.on("disconnect", () => {
	console.log(
		"🥺 Got disconnected from server",
		socket.io.opts.hostname + ":" + socket.io.opts.port,
	);
	currentPlayer = undefined;

	// Reset UI and go back to login screen
	void withScreenFade(playerName);
});

// Listen for when we're reconnected (either due to ours or the servers fault)
socket.io.on("reconnect", () => {
	console.log("🥰 Reconnected to server:", socket.io.opts.hostname + ":" + socket.io.opts.port);
});

/**
 * Functions
 */
const showLobbyAfterJoin = async (data: LobbyUpdatePayload, player?: Player) => {
	waitingModal?.remove();
	roundSelectionModal?.remove();
	roundSelectionModal = null;

	if (player) {
		currentPlayer = player;
	}
	latestLobbyData = data;
	lobbyInstance?.destroy();
	lobbyInstance = Lobby(socket, data);

	await withScreenFade(lobbyInstance.element);
};

const showGameOver = (payload: GameOverPayload) => {
	waitingModal?.remove();
	roundSelectionModal?.remove();
	roundSelectionModal = null;

	void withScreenFade(GameOver(socket, payload));
};

const startSinglePlayerWithSelectedRounds = () => {
	const name = currentPlayer?.name ?? "Player";
	void withScreenFade(SinglePlayerGame(name, selectedSinglePlayerRounds));
};

const openRoundSelectionModal = ({
	selectorName,
	onSelect,
	minRounds = 1,
	maxRounds = 10,
	defaultRounds = 3,
}: {
	selectorName: string;
	onSelect: (totalRounds: number) => void;
	minRounds?: number;
	maxRounds?: number;
	defaultRounds?: number;
}) => {
	waitingModal?.remove();
	roundSelectionModal?.remove();

	roundSelectionModal = SelectRoundsModal(
		selectorName,
		(totalRounds) => {
			onSelect(totalRounds);
			roundSelectionModal?.remove();
			roundSelectionModal = null;
		},
		minRounds,
		maxRounds,
		defaultRounds,
	);

	document.body.appendChild(roundSelectionModal);
};

/**
 * DOM Event Listeners
 */

// Gamestate listeners
socket.on("player:connected", (payload) => {
	showLobbyAfterJoin(payload.data, payload.player);
});

socket.on("lobby:update", (payload: LobbyUpdatePayload) => {
	latestLobbyData = payload;

	if (lobbyInstance) {
		lobbyInstance.updateGameTables(payload);
	}
});

window.addEventListener("app:forceLobbyFallback", () => {
	if (latestLobbyData) {
		void showLobbyAfterJoin(latestLobbyData, currentPlayer);
		return;
	}

	void withScreenFade(playerName);
});

socket.on("game:start", () => {
	waitingModal?.remove();
	roundSelectionModal?.remove();
	roundSelectionModal = null;

	// Preload game to be available before appending.
	const gameEl = Game(socket);

	const matchModal = MatchFoundModal(() => {
		matchModal.remove();
		void withScreenFade(gameEl);
	});

	document.body.appendChild(matchModal);
});

socket.on("rounds:select", (payload) => {
	openRoundSelectionModal({
		selectorName: payload.selectorName,
		onSelect: (totalRounds) => {
			socket.emit("rounds:selected", { totalRounds });
		},
		minRounds: payload.minRounds,
		maxRounds: payload.maxRounds,
		defaultRounds: payload.defaultRounds,
	});
});

socket.on("rounds:waiting", (payload) => {
	waitingModal?.remove();
	roundSelectionModal?.remove();

	roundSelectionModal = WaitingForRoundSelectionModal(payload.selectorName);
	document.body.appendChild(roundSelectionModal);
});

socket.on("player:disconnected", (payload: PlayerDisconnectedPayload) => {
	const data = payload.data;
	const playerWhoLeft = payload.player;
	const modal = DisconnectedUser(playerWhoLeft.name, () => {
		modal.remove();
		showLobbyAfterJoin(data, currentPlayer);
	});

	document.body.appendChild(modal);
});

socket.on("game:over", (winnerData) => {
	showGameOver(winnerData);
});

socket.on("player:returnedToLobby", (payload) => {
	showLobbyAfterJoin(payload);
});

window.addEventListener("app:startSinglePlayer", () => {
	openRoundSelectionModal({
		selectorName: currentPlayer?.name ?? "Player",
		onSelect: (totalRounds) => {
			selectedSinglePlayerRounds = totalRounds;
			startSinglePlayerWithSelectedRounds();
		},
	});
});

window.addEventListener("app:singlePlayerGameOver", (e) => {
	const payload = (e as CustomEvent<GameOverPayload>).detail;
	const div = document.createElement("div");
	div.className = "container flex-column gap-5 h-100 gameover-grid";

	const title = document.createElement("div");
	title.className = "d-flex justify-content-center align-items-center";
	title.innerHTML = `<h1 class="border-img-dark p-5 w-50 text-center lacquer-regular text-primary">Game over</h1>`;

	const buttonWrapper = document.createElement("div");
	buttonWrapper.className = "d-flex justify-content-center align-items-center gap-5";

	const score = buildSinglePlayerResult(payload);

	const playAgainBtn = document.createElement("button");
	playAgainBtn.type = "button";
	playAgainBtn.className = "btn border-img-green-solid fs-2";
	playAgainBtn.textContent = "Play again";
	playAgainBtn.addEventListener("click", () => {
		openRoundSelectionModal({
			selectorName: currentPlayer?.name ?? "Player",
			onSelect: (totalRounds) => {
				selectedSinglePlayerRounds = totalRounds;
				startSinglePlayerWithSelectedRounds();
			},
		});
	});

	const lobbyBtn = document.createElement("button");
	lobbyBtn.type = "button";
	lobbyBtn.className = "btn border-img-dark-solid fs-2";
	lobbyBtn.textContent = "To lobby";
	lobbyBtn.addEventListener("click", () => {
		if (latestLobbyData) {
			void showLobbyAfterJoin(latestLobbyData, currentPlayer);
		} else {
			void withScreenFade(playerName);
		}
	});

	buttonWrapper.appendChild(playAgainBtn);
	buttonWrapper.appendChild(lobbyBtn);
	div.appendChild(title);
	div.appendChild(score);
	div.appendChild(buttonWrapper);

	void withScreenFade(div);
});

function buildSinglePlayerResult(data: GameOverPayload): HTMLElement {
	const div = document.createElement("div");
	div.className = "d-flex p-5 gap-4 justify-content-evenly align-items-center border-img-dark";

	const buildItem = (name: string, score: number, isWinner: boolean) => {
		const item = document.createElement("div");
		item.className =
			"d-flex fs-1 px-5 py-4 flex-column justify-content-center align-items-center gap-2";
		item.innerHTML = `
			${isWinner ? '<span class="winnerIcon">👑</span>' : '<span class="loserIcon">😭</span>'}
			<span class="${isWinner ? "text-primary fw-bold winnerStyle" : ""}">${escapeHtml(name)}</span>
			<span>${score}</span>
		`;
		return item;
	};

	const vs = document.createElement("span");
	vs.className = "fs-1 text-muted lacquer-regular";
	vs.innerText = "Vs";

	div.appendChild(buildItem(data.playerOne.name, data.playerOne.score, data.playerOne.isWinner));
	div.appendChild(vs);
	div.appendChild(buildItem(data.playerTwo.name, data.playerTwo.score, data.playerTwo.isWinner));
	return div;
}
