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
	checkIfFastestPlayer,
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
export const activeGames: Record<string, ActiveGame> = {};

export interface ActiveGame {
	rounds: number;
	clickedPlayers: {
		playerId: string;
		reactionTime: number;
	}[];
	currentSpawnTime: number;
	fastestReactionTime: {
		playerId: string;
		time: number;
	};
}

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

			debug(`✅Created player: ${player.name} PlayerId: ${player.id}`);
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

			// Join player 2 into the game
			socket.join(availableGame.id);

			// Emit that game is starting
			io.to(availableGame.id).emit("game:start", gameStartPayload);

			// Create first virus
			const startingVirus = summonVirus();

			// Create game object
			activeGames[availableGame.id] = {
				rounds: 1,
				clickedPlayers: [],
				currentSpawnTime: Date.now() + startingVirus.delay,
				fastestReactionTime: {
					playerId: "",
					time: 9999,
				},
			};

			// Emit virus to all players
			io.to(availableGame.id).emit("game:virus", startingVirus);
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

		// Calculate player reaction tim
		const reactionTime = timestampPayload.timestamp - currentGame.currentSpawnTime;

		// Save player if and reaction time to game object
		currentGame.clickedPlayers.push({
			playerId: timestampPayload.playerId,
			reactionTime,
		});

		console.log("Current game obj", currentGame);

		if (currentGame.clickedPlayers.length === 2) {
			// Check if current player is fastest player
			checkIfFastestPlayer(currentGame);

			// If rounds less than ten, send new virus
			if (currentGame.rounds <= 3) {
				currentGame.clickedPlayers = [];

				currentGame.rounds++;

				const nextVirus = summonVirus();
				if (!nextVirus) return;

				// Update spawn time for next round
				currentGame.currentSpawnTime = Date.now() + nextVirus.delay;

				//Send next virus to players
				io.to(gameId).emit("game:virus", nextVirus);
			} else {
				console.log("Game over");
			}
		}
	});
};
