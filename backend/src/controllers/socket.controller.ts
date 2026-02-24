/**
 * Socket Controller
 */

import Debug from "debug";

import type {
	GameCreatedPayload,
	GameStartPayload,
	GamePayload,
	GameOverPayload,
	ScoreBoardPayload,
	ReactionData,
	LiveGameData,
	LobbyUpdatePayload,
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
	resetGame,
} from "../services/gameRoom.service.ts";
import type { Game } from "../../generated/prisma/client.ts";
import { createPlayer } from "../services/player.service.ts";
import { summonVirus } from "../services/virus.service.ts";
import { createScoreboard, getScoreboard } from "../services/updateScoreBoard.service.ts";
import type { AppServer, AppSocket } from "../types/socket.types.ts";
import { updateLobbyForAll } from "../lib/updateLobbyForAll.ts";

// Create a new debug instance
const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

/**
 * Variables
 */
const rematchArr: string[] = [];

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

export const buildLobbyUpdate = async (): Promise<LobbyUpdatePayload> => {
	// Get all played games from db
	const allPlayedGames = await getScoreboard();

	// Get all live games and convert to an array
	const allLiveGames: LiveGameData[] = Object.entries(activeGames).map(([gameId, game]) => {
		return {
			gameId,
			player_one_name: game.player_one_name,
			player_one_score: game.player_one_score,
			player_two_name: game.player_two_name,
			player_two_score: game.player_two_score,
		};
	});

	return {
		allPlayedGames,
		allLiveGames,
	};
};

// Handle new socket connection
export const handleConnection = (socket: AppSocket, io: AppServer) => {
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

			// Add new player to lobby
			socket.join("lobby");

			// Emit data about current state of played and live games to all
			updateLobbyForAll(io);

			// Save player name on socket for global use
			socket.data.name = playerName;
			const data = await buildLobbyUpdate();
			// Emit player creation confirmation for game start
			socket.emit("player:connected", { player, data });

			debug(`✅Created player: ${player.name} PlayerId: ${player.id}`);
		} catch (err) {
			console.error("⚠️Error handling playerJoinLobbyRequest:", err);
		}
	});

	socket.on("player:left", async (payload) => {
		const player = await getPlayerByPlayerId(payload.playerId);
		const game = await getGameByPlayerId(payload.playerId);

		if (!game) {
			return;
		}

		if (!player) {
			return;
		}

		await deleteGame(socket.id);

		io.to(game.id).emit("player:left", { playerId: player.id, name: player.name });

		// Send latest lobby to client after leaving game
		const updatedLobbyData: LobbyUpdatePayload = await buildLobbyUpdate();
		socket.emit("lobby:update", updatedLobbyData);
	});

	socket.on("player:rematch", async (payload) => {
		const player = await getPlayerByPlayerId(payload.playerId);
		const game = await getGameByPlayerId(payload.playerId);

		if (!game) {
			return;
		}
		if (!player) {
			return;
		}

		const checkArr = rematchArr.includes(payload.playerId!);
		if (!checkArr) {
			rematchArr.push(payload.playerId);
		}

		const playerTwoCheck = rematchArr.includes(game.player_one_id!);
		const playerOneCheck = rematchArr.includes(game.player_two_id!);

		console.log(rematchArr);

		if (playerOneCheck && playerTwoCheck) {
			const startingVirus = summonVirus();
			await resetGame(game.id);

			// delete rematchArr[rematchArr.indexOf(game.player_one_id)];
			// delete rematchArr[rematchArr.indexOf(game.player_two_id!)];
			rematchArr.pop();
			rematchArr.pop();

			const gameStartPayload: GameStartPayload = {
				gameId: game.id,
				message: "All players joined. Starting game",
			};

			io.to(game.id).emit("game:start", gameStartPayload);

			activeGames[game.id] = {
				round: 1,
				player_one_id: game.player_one_id,
				player_two_id: game.player_two_id!,
				player_one_name: game.player_one_name!,
				player_two_name: game.player_two_name!,
				player_one_score: 0,
				player_two_score: 0,
				clickedPlayers: [],
				currentSpawnTime: Date.now() + startingVirus.delay,
				fastest_player_id: "",
				fastest_Time: 9999,
			};

			const gameData: GamePayload = {
				id: game.id,
				name: null,
				player_one_id: activeGames[game.id].player_one_id,
				player_two_id: activeGames[game.id].player_two_id,
				player_one_name: activeGames[game.id].player_one_name,
				player_two_name: activeGames[game.id].player_two_name,
				player_one_score: activeGames[game.id].player_one_score,
				player_two_score: activeGames[game.id].player_two_score,
				round: activeGames[game.id].round,
				fastest_player_id: activeGames[game.id].fastest_player_id,
				fastest_Time: activeGames[game.id].fastest_Time,
			};

			io.to(game.id).emit("game:data", gameData);

			setTimeout(() => {
				io.to(game.id).emit("game:virus", startingVirus);
			}, 4000);
		} else {
			socket.to(game.id).emit("player:rematch", {
				playerId: payload.playerId,
				name: player.name,
			});
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

			// Emit data about current state of played and live games to all
			updateLobbyForAll(io);

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
			setTimeout(() => {
				io.to(availableGame.id).emit("game:virus", startingVirus);
			}, 4000);
		}
	});

	// Handle user disconnecting
	socket.on("disconnect", async () => {
		const gameToDelete = await getGameByPlayerId(socket.id);
		const playerWhoLeft = await getPlayerByPlayerId(socket.id);

		// Delete game from activeGames
		if (gameToDelete) {
			delete activeGames[gameToDelete.id];
		}

		// Emit data about current state of played and live games to all
		updateLobbyForAll(io);

		const updatedLobbydata = await buildLobbyUpdate();

		if (gameToDelete && playerWhoLeft && gameToDelete.player_two_id) {
			// Tell remaining player that opponent disconnected
			socket.to(gameToDelete.id).emit("player:disconnected", {
				player: playerWhoLeft,
				data: updatedLobbydata,
			});

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
	socket.on("player:clicked", async (timestampPayload) => {
		const gameId = socket.data.gameId;
		const currentGame = activeGames[gameId];

		//Player reaction time
		const reactionTime = timestampPayload.timestamp;

		const reactionDataPayLoad: ReactionData = {
			playerId: timestampPayload.playerId,
			reactionTime,
		};
		// Emit reaction time to opponent(s)
		io.to(gameId).emit("player:reactionTime", reactionDataPayLoad);

		// Save player and reaction time to game object
		currentGame.clickedPlayers.push({
			playerId: timestampPayload.playerId,
			reactionTime,
		});

		if (currentGame.clickedPlayers.length === 2) {
			// Check if current player is fastest player
			const fastestInRound = checkIfFastestPlayer(currentGame);

			// Compare reaction time of both
			if (fastestInRound.playerId === currentGame.player_one_id) {
				currentGame.player_one_score++;
				console.log(`Fastest player this round ${currentGame.player_one_name}`);
			} else {
				currentGame.player_two_score++;
				console.log(`Fastest player this round ${currentGame.player_two_name}`);
			}
			console.log("Current game obj", currentGame);

			currentGame.round++;
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

			// Emit data about current state of played and live games to all
			updateLobbyForAll(io);

			// If round less than ten, send new virus
			if (currentGame.round <= 3) {
				currentGame.clickedPlayers = [];

				//Create next virus
				const nextVirus = summonVirus();
				if (!nextVirus) return;
				//Send next virus to players
				io.to(gameId).emit("game:virus", nextVirus);

				// Update spawn time for next round
				currentGame.currentSpawnTime = Date.now() + nextVirus.delay;
				io.to(gameId).emit("game:data", gameData);
			} else {
				console.log("Game over");

				const scoreboardData: ScoreBoardPayload = {
					player_one_name: currentGame.player_one_name,
					player_two_name: currentGame.player_two_name,
					player_one_score: currentGame.player_one_score,
					player_two_score: currentGame.player_two_score,
					name: "",
				};

				await createScoreboard(scoreboardData);

				const isPlayerOneWinner =
					currentGame.player_one_score > currentGame.player_two_score;
				const isplayerTwoWinner =
					currentGame.player_one_score < currentGame.player_two_score;

				const winnerData: GameOverPayload = {
					playerOne: {
						name: currentGame.player_one_name,
						score: currentGame.player_one_score,
						isWinner: isPlayerOneWinner,
					},
					playerTwo: {
						name: currentGame.player_two_name,
						score: currentGame.player_two_score,
						isWinner: isplayerTwoWinner,
					},
				};

				io.to(gameId).emit("game:over", winnerData);

				// Delete game from activeGames
				delete activeGames[gameId];

				// Emit data about current state of played and live games to all
				updateLobbyForAll(io);
			}
		}
	});
};
