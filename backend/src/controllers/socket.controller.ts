/**
 * Socket Controller
 */
import { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { updateScoreBoard } from "../services/score.service.ts";

import type {
	GameCreatedPayload,
	GameStartPayload,
	ScorePayload,
} from "@shared/types/payloads.types.ts";

import {
	createGame,
	findAvailableGame,
	joinGame,
	deleteGame,
	getGameByPlayerId,
	getPlayerByPlayerId,
	deletePlayer,
} from "../services/gameRoom.service.ts";
import type { Game } from "../../generated/prisma/client.ts";
import { createPlayer } from "../services/player.service.ts";
import { summonVirus } from "../services/virus.service.ts";

// Create a new debug instance
const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

/**
 * Variables
 */
const activeGames: Record<string, { rounds: number; clickedPlayers: string[] }> = {};

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
			const player = await createPlayer({
				id: socket.id,
				name: playerName,
			});
			socket.emit("player:confirmed", player);

			debug("✅Created player: %o", player);
		} catch (err) {
			console.error("⚠️Error handling playerJoinLobbyRequest:", err);
		}
	});

	/**
	 * Join game, await matchmaking
	 */
	socket.on("playerJoinGameRequest", async (playerId: string) => {
		// Look for available games and create or join
		const availableGame = await findAvailableGame();

		if (availableGame === null) {
			const newGame: Game = await createGame(playerId);

			// Join Player 1 into game
			socket.join(newGame.id);

			// Save game id on socket to be used everywhere
			socket.data.gameId = newGame.id;

			const gameCreatedPayload: GameCreatedPayload = {
				gameId: newGame.id,
				message: "Waiting for opponent...",
			};
			// Emit to Player 1 that game is created and is waiting for opponent
			socket.emit("game:created", gameCreatedPayload);
		} else {
			await joinGame(playerId, availableGame.id);

			// Save game id on socket to be used everywhere
			socket.data.gameId = availableGame.id;

			// Send signal that games is full and to start game
			const gameStartPayload: GameStartPayload = {
				gameId: availableGame.id,
				message: "All players joined. Starting game",
			};

			activeGames[socket.data.gameId] = { rounds: 0, clickedPlayers: [] };

			// Join player 2 into the game
			socket.join(availableGame.id);

			// Emit that game is starting
			io.to(availableGame.id).emit("game:start", gameStartPayload);
		}
	});

	// Handle user disconnecting
	socket.on("disconnect", async () => {
		const gameToDelete = await getGameByPlayerId(socket.id);
		const playerWhoLeft = await getPlayerByPlayerId(socket.id);

		if (gameToDelete && playerWhoLeft && gameToDelete.player_two_id) {
			// Tell remaining player that opponent disconnected
			socket.to(gameToDelete.id).emit("player:disconnected", playerWhoLeft);

			// Delete game on disconnect
			await deleteGame(socket.id);
			debug("Game deleted", gameToDelete.id);
		} else if (gameToDelete) {
			// Delete game if we have an empty game
			await deleteGame(socket.id);
		}

		// Delete remaining unused players to avoid ghosts
		if (playerWhoLeft) {
			await deletePlayer(socket.id);
			debug("Disconnected player deleted");
		}

		debug("👋 A user disconnected with id: %s", socket.id);
	});

	/**
	 * WIP: Listen for incoming score updates
	 */
	socket.on("updateScore", async (payload: ScorePayload) => {
		//Update score in db
		await updateScoreBoard(payload);

		// Update score on client
		socket.to(payload.id).emit("score", payload);
	});

	/**
	 * Summon the virus
	 */
	// WIP

	socket.on("player:clicks", (timestampPayload) => {
		const gameId = socket.data.gameId;
		const currentGame = activeGames[gameId];

		currentGame.clickedPlayers.push(timestampPayload.playerId);

		// Check who clicked fastest.Checks clickTime1 vs clickTime2. Set fastest time and player id in fastest_Time
		checkWhoClickedFastest();

		if (currentGame.clickedPlayers.length === 2) {
			// Send clickedPlayers array to service to compare clicked times

			// If rounds less than ten, send new virus
			if (currentGame.rounds <= 10) {
				currentGame.rounds++;

				const virusPayload = summonVirus();
				if (!virusPayload) return;

				io.to(gameId).emit("game:virus", virusPayload);
			}
			// Else If ten, goto gameover screen. Transfer game to ScoreBoard collection
		}
		// io.to(gameId).emit("game:over", winnerId);
		// }
		// Add payload to while loop until both players have clicked. Then add to db.
	});
};
