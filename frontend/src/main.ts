import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import { io, Socket } from "socket.io-client";

// Styling
import "./assets/scss/style.scss";
import "./assets/scss/game.scss";

// Types
import type { Player } from "../../backend/generated/prisma/client";
import type { GameStartPayload } from "@shared/types/payloads.types";

// Pages
import Lobby, { waitingModal } from "./pages/lobby";
import Game from "./pages/game";
import { InputPlayerName } from "./components/InputPlayerName";
import GameOver from "./pages/gameover";
import { MatchFoundModal } from "./components/LobbyModals";

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("🙇 Connecting to Socket.IO Server at:", SOCKET_HOST);

// Connect to Socket.IO Server
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST);

/**
 * Page Component inits
 */
const lobbyPage = Lobby(socket);
const playerName = InputPlayerName(socket);

/**
 * DOM References
 */
const app = document.querySelector<HTMLDivElement>("#app")!;

/**
 * Add page to index.html
 */
app.appendChild(playerName);

/**
 * Variables
 */
let currentPlayer: Player | undefined = undefined;

/**
 * Socket Event Listeners
 */

// Listen for when a connection is established
socket.on("connect", () => {
	console.log("💥 Connected to server", socket.io.opts.hostname + ":" + socket.io.opts.port);
	console.log("🔗 Socket ID:", socket.id);
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
const showLobbyAfterJoin = (player?: Player) => {
	if (player) {
		console.log("Player %s joined", player.name);
		currentPlayer = player;
	}

	app.innerHTML = "";
	app.appendChild(lobbyPage);
};

const showGameBoardAtGameStart = (payload: GameStartPayload) => {
	app.innerHTML = "";
	app.appendChild(Game(socket, payload.gameId));
};

const showGameOver = () => {
	app.innerHTML = "";
	app.appendChild(GameOver(socket));
};

/**
 * DOM Event Listeners
 */

// Gamestate listeners
socket.on("player:confirmed", showLobbyAfterJoin);

socket.on("game:created", (payload) => {
	console.log(payload.message);
});

socket.on("game:start", (payload) => {
	waitingModal?.remove();

	const matchModal = MatchFoundModal();
	document.body.appendChild(matchModal);

	setTimeout(() => {
		matchModal.remove();

		console.log(payload.message);
		showGameBoardAtGameStart(payload);
	}, 3000);
});

socket.on("player:disconnected", (playerWhoLeft: Player) => {
	alert(playerWhoLeft.name + " disconnected");
	showLobbyAfterJoin(currentPlayer);
});

socket.on("game:over", () => {
	showGameOver();
});
