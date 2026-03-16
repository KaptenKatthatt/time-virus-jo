import { io } from "socket.io-client";

// Styling
import "./assets/scss/style.scss";
import "./assets/scss/game.scss";

// Types
import type { Player } from "../../backend/generated/prisma/client";

// Pages
import Lobby, { waitingModal } from "./pages/lobby";
import Game from "./pages/game";
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
let queuedScreenTransition: Promise<void> = Promise.resolve();

applyFadeDurationCssVar();

const wait = (ms: number) =>
	new Promise<void>((resolve) => {
		window.setTimeout(resolve, ms);
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

			requestAnimationFrame(() => {
				overlay.classList.add("is-visible");
			});

			await wait(APP_FADE_DURATION_MS);
			replaceAppContent(nextScreen);

			requestAnimationFrame(() => {
				overlay.classList.remove("is-visible");
			});

			await wait(APP_FADE_DURATION_MS);
			overlay.remove();
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
	waitingModal?.remove();
	roundSelectionModal?.remove();

	roundSelectionModal = SelectRoundsModal(
		payload.selectorName,
		(totalRounds) => {
			socket.emit("rounds:selected", { totalRounds });
			roundSelectionModal?.remove();
			roundSelectionModal = null;
		},
		payload.minRounds,
		payload.maxRounds,
		payload.defaultRounds,
	);

	document.body.appendChild(roundSelectionModal);
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
