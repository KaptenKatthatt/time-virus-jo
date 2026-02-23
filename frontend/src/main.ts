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

// Pages
import Lobby, { waitingModal } from "./pages/lobby";
import Game from "./pages/game";
import { InputPlayerName } from "./components/InputPlayerName";
import GameOver from "./pages/gameover";
import { DisconnectedUser, MatchFoundModal } from "./components/LobbyModals";
import type { GameOverPayload, ScoreBoardPayload } from "@shared/types/payloads.types";
import Scoreboard from "./components/Scoreboard";

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("🙇 Connecting to Socket.IO Server at:", SOCKET_HOST);

// Connect to Socket.IO Server
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST);

/**
 * Page Component inits
 */

const playerName = InputPlayerName(socket);

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
const showLobbyAfterJoin = async (data: ScoreBoardPayload[], player?: Player) => {
	if (player) {
		console.log("Player %s joined", player.name);
		currentPlayer = player;
	}
	
	const lobbyPage = Lobby(socket, data);
	app.innerHTML = "";
	app.appendChild(lobbyPage);
};

const showGameBoardAtGameStart = () => {
	app.innerHTML = "";
	app.appendChild(Game(socket));
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
		showGameBoardAtGameStart();
	}, 3000);
});

socket.on("player:disconnected", (payload) => {
	const data = payload.data
	const playerWhoLeft = payload.player
	const modal = DisconnectedUser(playerWhoLeft.name, () => {
		modal.remove();
		showLobbyAfterJoin(data, currentPlayer);
	});

	document.body.appendChild(modal);
});

socket.on("game:over", (winnerData) => {
	showGameOver(winnerData);
});
