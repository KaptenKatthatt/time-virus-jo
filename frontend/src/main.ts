import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import { io, Socket } from "socket.io-client";

import { GameBoard } from "./components/GameBoard";
import { UsernameInput } from "./components/InputUsername";
// Styling
import "./assets/scss/style.scss";
import Lobby from "./pages/lobby";

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("🙇 Connecting to Socket.IO Server at:", SOCKET_HOST);

// Connect to Socket.IO Server
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST);

/**
 * Component inits
 */
// GameBoard(socket);
const usernameInput = UsernameInput(socket);

/**
 * Page Component inits
 */
const lobbyPage = Lobby();

/**
 * DOM References
 */
const app = document.querySelector<HTMLDivElement>("#app")!;

/**
 * Add page to index.html
 */
// app.appendChild(lobbyPage);
app.appendChild(usernameInput);

/**
 * Variables
 */

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
});

// Listen for when we're reconnected (either due to ours or the servers fault)
socket.io.on("reconnect", () => {
	console.log("🥰 Reconnected to server:", socket.io.opts.hostname + ":" + socket.io.opts.port);
});

/**
 * Functions
 */

/**
 * DOM Event Listeners
 */
