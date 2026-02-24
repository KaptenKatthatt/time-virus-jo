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
import { DisconnectedUser, MatchFoundModal } from "./components/LobbyModals";
import type { GameOverPayload, LobbyUpdatePayload } from "@shared/types/payloads.types";
import type { AppClientSocket } from "./types/socket.types";

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("🙇 Connecting to Socket.IO Server at:", SOCKET_HOST);

// Connect to Socket.IO Server
const socket: AppClientSocket = io(SOCKET_HOST);

/**
 * Page Component inits
 */

// const playerName = InputPlayerName(socket);

/**
 * DOM References
 */
const app = document.querySelector<HTMLDivElement>("#app")!;

/**
 * Variables
 */
let currentPlayer: Player | undefined = undefined;

/**
 * Socket Event Listeners
 */

// const lobbyPage = Lobby(socket);
const playerName = InputPlayerName(socket);

// Listen for when a connection is established
socket.on("connect", () => {
	console.log("💥 Connected to server", socket.io.opts.hostname + ":" + socket.io.opts.port);
	console.log("🔗 Socket ID:", socket.id);

	/**
	 * Add page to index.html
	 */
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
	app.innerHTML = "";
	app.appendChild(playerName);
});

// Listen for when we're reconnected (either due to ours or the servers fault)
socket.io.on("reconnect", () => {
	console.log("🥰 Reconnected to server:", socket.io.opts.hostname + ":" + socket.io.opts.port);
});

/**
 * Functions
 */
// TODO Refactor show/hide functions into one function
const showLobbyAfterJoin = async (data: LobbyUpdatePayload, player?: Player) => {
	if (player) {
		console.log("Player %s joined", player.name);
		currentPlayer = player;
	}

	const lobbyPage = Lobby(socket, data);
	app.innerHTML = "";
	app.appendChild(lobbyPage);
};

const showGameOver = (payload: GameOverPayload) => {
	app.innerHTML = "";
	app.appendChild(GameOver(socket, payload));
};

/**
 * DOM Event Listeners
 */

// Gamestate listeners
socket.on("player:confirmed", (payload) => {
	showLobbyAfterJoin(payload.data, payload.player);
});

socket.on("lobby:update", (payload: LobbyUpdatePayload) => {
	Lobby(socket, payload);
});

socket.on("game:created", (payload) => {
	console.log(payload.message);
});

socket.on("game:start", () => {
	waitingModal?.remove();

	const matchModal = MatchFoundModal();
	document.body.appendChild(matchModal);

	// Preload game to be available before appending.
	const gameEl = Game(socket);

	// Wait for Matching countdown modal
	setTimeout(() => {
		matchModal.remove();
		app.innerHTML = "";
		app.appendChild(gameEl);
	}, 3000);
});

socket.on("player:disconnected", (payload) => {
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
