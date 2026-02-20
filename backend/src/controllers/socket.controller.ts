/**
 * Socket Controller
 */
import { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";

import type {
	GameCreatedPayload,
	GameStartPayload,
	GamePayload,
	GameOverPayload,
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

//TODO Change Record to something understandable
export const activeGames: Record<string, ActiveGame> = {};

export interface ActiveGame {
	round: number;
	player_one_id: string;
	player_two_id: string;
	player_one_name: string;
	player_two_name: string;
	player_one_score: number;
	player_two_score: number;
	clickedPlayers: {
		playerId: string;
		reactionTime: number;
	}[];
	currentSpawnTime: number;
	fastest_player_id: string;
	fastest_Time: number;
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

			// Save player name on socket for global use
			socket.data.name = playerName;

			// Emit player creation confirmation for game start
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
			const newGame: Game = await createGame(playerId, socket.data.name);

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
			await joinGame(playerId, availableGame.id, socket.data.name);

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

			// Timer to wait for modal to clear before starting game, to avoid race condition
			setTimeout(() => {
				// Create first virus
				const startingVirus = summonVirus();

				// Create game object
				activeGames[availableGame.id] = {
					round: 1,
					player_one_id: availableGame.player_one_id,
					player_two_id: playerId,
					player_one_name: availableGame.player_one_name!,
					player_two_name: socket.data.name,
					player_one_score: 0,
					player_two_score: 0,
					clickedPlayers: [],
					currentSpawnTime: Date.now() + startingVirus.delay,
					fastest_player_id: "",
					fastest_Time: 9999,
				};

				console.log("Created game", activeGames[availableGame.id]);

				const gameData: GamePayload = {
					id: availableGame.id,
					name: null,
					player_one_id: activeGames[availableGame.id].player_one_id,
					player_two_id: activeGames[availableGame.id].player_two_id,
					player_one_name: activeGames[availableGame.id].player_one_name,
					player_two_name: activeGames[availableGame.id].player_two_name,
					player_one_score: activeGames[availableGame.id].player_one_score,
					player_two_score: activeGames[availableGame.id].player_two_score,
					round: activeGames[availableGame.id].round,
					fastest_player_id: activeGames[availableGame.id].fastest_player_id,
					fastest_Time: activeGames[availableGame.id].fastest_Time,
				};
				io.to(availableGame.id).emit("game:data", gameData);

				// Emit virus to all players
				io.to(availableGame.id).emit("game:virus", startingVirus);

				//Set spawn time for virus
			}, 3000);
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
	 * Summon the virus
	 */
	socket.on("player:clicked", (timestampPayload) => {
		const gameId = socket.data.gameId;
		const currentGame = activeGames[gameId];

		// Calculate player reaction time
		const reactionTime = timestampPayload.timestamp - currentGame.currentSpawnTime;

		// Compare reaction time of both

		// Save player and reaction time to game object
		currentGame.clickedPlayers.push({
			playerId: timestampPayload.playerId,
			reactionTime,
		});

		if (currentGame.clickedPlayers.length === 2) {
			// Check if current player is fastest player
			const fastestInRound = checkIfFastestPlayer(currentGame);

			if (fastestInRound.playerId === currentGame.player_one_id) {
				currentGame.player_one_score++;
				console.log(`Fastest player this round ${currentGame.player_one_name}`);
			} else {
				currentGame.player_two_score++;
				console.log(`Fastest player this round ${currentGame.player_two_name}`);
			}
			console.log("Current game obj", currentGame);

			// Emit result update (fastest player this round and fastest in game)
			const gameData: GamePayload = {
				id: gameId,
				name: null,
				player_one_id: currentGame.player_one_id,
				player_two_id: currentGame.player_two_id,
				player_one_name: currentGame.player_one_name,
				player_two_name: currentGame.player_two_name,
				player_one_score: currentGame.player_one_score,
				player_two_score: currentGame.player_two_score,
				round: currentGame.round,
				fastest_player_id: currentGame.fastest_player_id,
				fastest_Time: currentGame.fastest_Time,
			};

			io.to(gameId).emit("game:data", gameData);

			// If round less than ten, send new virus
			if (currentGame.round < 3) {
				currentGame.clickedPlayers = [];
				currentGame.round++;

				//Create next virus
				const nextVirus = summonVirus();
				if (!nextVirus) return;
				//Send next virus to players
				io.to(gameId).emit("game:virus", nextVirus);

				// Update spawn time for next round
				currentGame.currentSpawnTime = Date.now() + nextVirus.delay;

				//Set spawn time for virus
				const spawnTime = Date.now();
				console.log("Setting spawn time to", spawnTime);
			} else {
				console.log("Game over");
				
				let winnerId: string | null = null;

				if (currentGame.player_one_score > currentGame.player_two_score) {
					winnerId = currentGame.player_one_id;
				} else if (currentGame.player_two_score > currentGame.player_one_score) {
					winnerId = currentGame.player_two_id;
				} else {
					winnerId = null; 
				}

				const winnerData: GameOverPayload = {
					player_one_name: currentGame.player_one_name,
					player_two_name: currentGame.player_two_name,
					player_one_score: currentGame.player_one_score,
					player_two_score: currentGame.player_two_score,
					winner: winnerId,
				}

				io.to(gameId).emit("game:over", winnerData);
			}
		}
	});
};
