import "./config/loadEnv.ts";
import app from "./app.ts";
import Debug from "debug";
import http from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";
import { handleConnection } from "./controllers/socket.controller.ts";

// Read port to start server on from `.env`, otherwise default to port 3000
const PORT = process.env.PORT || 3000;

// Create a new debug instance
const debug = Debug("backend:server");

/**
 * Create HTTP and Socket.IO server.
 */
const httpServer = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
	cors: {
		credentials: true,
		origin: "*",
	},
});

/**
 * Handle incoming Socket.IO connection
 */
io.on("connection", (socket) => {
	debug("Socket connected: %s", socket.id);
	handleConnection(socket, io);
});

/**
 * Listen on provided port, on all network interfaces.
 */
httpServer.listen(PORT);

/**
 * Event listener for HTTP server "error" event.
 */
httpServer.on("error", (err: NodeJS.ErrnoException) => {
	if (err.syscall !== "listen") {
		throw err;
	}

	switch (err.code) {
		case "EACCES":
			console.error(`🦸‍♀️ Port ${PORT} requires elevated privileges`);
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(`🛑 Port ${PORT} is already in use`);
			process.exit(1);
			break;
		default:
			throw err;
	}
});

/**
 * Event listener for HTTP server "listening" event.
 */
httpServer.on("listening", () => {
	console.log(`🌎 Yay, server started on http://localhost:${PORT}`);
});
