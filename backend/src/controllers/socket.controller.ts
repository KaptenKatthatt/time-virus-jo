/**
 * Socket Controller
 */
import { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { updateScoreBoard } from "../services/score.service.ts";
import { createUser } from "../services/player.service.ts";
import type {
	GameCreatedPayload,
	GameStartPayload,
	ScorePayload,
} from "@shared/types/payloads.types.ts";
import { createGame, creategame } from "../services/game.service.ts";

import { findAvailableGame, joinGame } from "../services/gameRoom.service.ts";
import type { Game } from "../../generated/prisma/client.ts";

// Create a new debug instance
const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

// Handle new socket connection
export const handleConnection = (
	socket: Socket<ClientToServerEvents, ServerToClientEvents>,
	io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
	// Yay someone connected to me
	debug("🙋 A user connected with id: %s", socket.id);

	/**
	 * Login user and save name to DB
	 */
	socket.on("playerJoinLobbyRequest", async (playerName: string) => {
		try {
			const user = await createUser({
				id: socket.id,
				name: playerName,
			});
			socket.emit("player:confirmed", user);

			debug("✅Created user: %o", user);
		} catch (err) {
			console.error("⚠️Error handling playerJoinLobbyRequest:", err);
		}
	});

	/**
	 * Join game, await matchmaking
	 */
	socket.on("playerJoinGameRequest", async (playerId: string) => {
		// Look for a game where player_two_id is null;
		// If found, add player to that gameId
		// Else create game and add to player_one_id column

		// 1. Findfirst. Found any games?
		// 1.1 Check if player_two is empy
		// 1.2 Join it
		// 2.  Else Create game

		// Look for available games and create or join
		const availableGame = await findAvailableGame();
		if (availableGame === null) {
			const newGame: Game = await createGame(playerId);

			// Join Player 1 into game
			socket.join(newGame.id);

			const gameCreatedPayload: GameCreatedPayload = {
				gameId: newGame.id,
				message: "Waiting for opponent...",
			};
			// Emit to Player 1 that game is created and is waiting for opponent
			socket.emit("game:created", gameCreatedPayload);
		} else {
			joinGame(availableGame.id, playerId);

			// Send signal that games is full and to start game
			const gameStartPayload: GameStartPayload = {
				gameId: availableGame.id,
				message: "All players joined. Starting game",
			};
			io.to(availableGame.id).emit("game:start", gameStartPayload);
		}
	});

	// Handle user disconnecting
	socket.on("disconnect", () => {
		debug("👋 A user disconnected with id: %s", socket.id);
		// TODO: Handle disconnect while waiting for matching. Delete game.
	});

	/**
	 * Listen for incoming score updates
	 */
	socket.on("updateScore", async (payload: ScorePayload) => {
		//Update score in db
		await updateScoreBoard(payload);

		// Update score on client
		socket.to(payload.id).emit("score", payload);
	});

	// calculateScore(timestamp1, timestamp2)
	// Jämför

	/**
	 * Receive timestamp from client
	 */

	/**
	 *
	 */
};
