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
	ChatMessage,
	SelectRoundsPayload,
	WaitingForRoundsPayload,
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
	getAllPlayers,
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
const chatHistory: ChatMessage[] = [];
const rematchRequestsByGame = new Map<string, string[]>();
const pendingRoundSelectionByGame = new Map<
	string,
	{
		selectorPlayerId: string;
		selectorName: string;
	}
>();
const DEFAULT_ROUNDS = 3;
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 10;

export const activeGames: Record<string, ActiveGame> = {};

export interface ActiveGame {
	round: number;
	totalRounds: number;
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

	// Get all online players from db
	const onlinePlayers = await getAllPlayers();

	return {
		allPlayedGames,
		allLiveGames,
		onlinePlayers,
	};
};

const buildLobbyUpdateForIo = async (io: AppServer): Promise<LobbyUpdatePayload> => {
	const basePayload = await buildLobbyUpdate();

	const lobbySockets = await io.in("lobby").fetchSockets();
	const socketPlayers = lobbySockets
		.map((lobbySocket) => ({
			id: lobbySocket.id,
			name: lobbySocket.data.name as string | undefined,
		}))
		.filter((player) => Boolean(player.name));

	const mergedPlayersById = new Map<string, { id: string; name: string }>();

	for (const player of basePayload.onlinePlayers) {
		mergedPlayersById.set(player.id, player);
	}

	for (const player of socketPlayers) {
		mergedPlayersById.set(player.id, { id: player.id, name: player.name! });
	}

	return {
		...basePayload,
		onlinePlayers: Array.from(mergedPlayersById.values()),
	};
};

const normalizeTotalRounds = (totalRounds: number) => {
	if (!Number.isFinite(totalRounds)) {
		return DEFAULT_ROUNDS;
	}

	const parsedRounds = Math.floor(totalRounds);
	return Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, parsedRounds));
};

const startGameForRoom = async (io: AppServer, game: Game, totalRounds: number) => {
	const startingVirus = summonVirus();
	const normalizedRounds = normalizeTotalRounds(totalRounds);

	const gameStartPayload: GameStartPayload = {
		gameId: game.id,
		message: "All players joined. Starting game",
	};

	io.to(game.id).emit("game:start", gameStartPayload);

	activeGames[game.id] = {
		round: 1,
		totalRounds: normalizedRounds,
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

	await updateLobbyForAll(io);

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
		totalRounds: activeGames[game.id].totalRounds,
		fastest_player_id: activeGames[game.id].fastest_player_id,
		fastest_Time: activeGames[game.id].fastest_Time,
	};

	io.to(game.id).emit("game:data", gameData);

	setTimeout(() => {
		io.to(game.id).emit("game:virus", startingVirus);
	}, 4000);
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
			// Save player name on socket for global use
			socket.data.name = playerName;

			const player = await createPlayer({
				id: socket.id,
				name: playerName,
			});

			// Add new player to lobby
			socket.join("lobby");

			// Emit data about current state of played and live games to all
			await updateLobbyForAll(io);
			const data = await buildLobbyUpdateForIo(io);
			// Emit player creation confirmation for game start
			socket.emit("player:connected", { player, data });

			// Send chat history to the newly joined player
			for (const msg of chatHistory) {
				socket.emit("chat:message", msg);
			}

			debug(`✅Created player: ${player.name} PlayerId: ${player.id}`);
		} catch (err) {
			console.error("⚠️Error handling playerJoinLobbyRequest:", err);
		}
	});

	socket.on("player:left", async (payload) => {
		const playerId = payload.playerId;
		const player = await getPlayerByPlayerId(playerId);
		const game = await getGameByPlayerId(playerId);

		if (game) {
			delete activeGames[game.id];
			rematchRequestsByGame.delete(game.id);
			pendingRoundSelectionByGame.delete(game.id);
			socket.leave(game.id);
			socket.data.gameId = "";

			await deleteGame(playerId);
			await updateLobbyForAll(io);

			if (player) {
				io.to(game.id).emit("player:left", { playerId: player.id, name: player.name });
			}
		}

		// Always return caller to lobby even if game was already deleted by opponent
		const updatedLobbyData: LobbyUpdatePayload = await buildLobbyUpdateForIo(io);
		socket.emit("player:returnedToLobby", updatedLobbyData);
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

		const existingRequests = rematchRequestsByGame.get(game.id) ?? [];
		if (!existingRequests.includes(payload.playerId)) {
			existingRequests.push(payload.playerId);
			rematchRequestsByGame.set(game.id, existingRequests);
		}

		if (existingRequests.length === 1) {
			socket.to(game.id).emit("player:rematch", {
				playerId: payload.playerId,
				name: player.name,
			});
			return;
		}

		if (existingRequests.length < 2) {
			return;
		}

		await resetGame(game.id);

		const selectorPlayerId = existingRequests[0];
		const selectorName =
			selectorPlayerId === game.player_one_id ? game.player_one_name! : game.player_two_name!;

		pendingRoundSelectionByGame.set(game.id, {
			selectorPlayerId,
			selectorName,
		});

		rematchRequestsByGame.delete(game.id);

		const selectPayload: SelectRoundsPayload = {
			gameId: game.id,
			selectorName,
			minRounds: MIN_ROUNDS,
			maxRounds: MAX_ROUNDS,
			defaultRounds: DEFAULT_ROUNDS,
		};
		const waitingPayload: WaitingForRoundsPayload = {
			gameId: game.id,
			selectorName,
		};
		const waitingPlayerId =
			selectorPlayerId === game.player_one_id ? game.player_two_id! : game.player_one_id;

		io.to(selectorPlayerId).emit("rounds:select", selectPayload);
		io.to(waitingPlayerId).emit("rounds:waiting", waitingPayload);
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
			await updateLobbyForAll(io);

			// Save game id on socket to be used everywhere
			socket.data.gameId = newGame.id;

			const gameCreatedPayload: GameCreatedPayload = {
				gameId: newGame.id,
				message: "Waiting for opponent...",
			};
			// Emit to Player 1 that game is created and is waiting for opponent
			socket.emit("game:created", gameCreatedPayload);
		} else {
			const joinedGame = await joinGame(playerId, availableGame.id, socket.data.name);

			// Save game id on socket to be used everywhere
			socket.data.gameId = availableGame.id;

			// Join player 2 into the game
			socket.join(availableGame.id);

			const selectorName = joinedGame.player_one_name!;
			pendingRoundSelectionByGame.set(joinedGame.id, {
				selectorPlayerId: joinedGame.player_one_id,
				selectorName,
			});

			const selectPayload: SelectRoundsPayload = {
				gameId: joinedGame.id,
				selectorName,
				minRounds: MIN_ROUNDS,
				maxRounds: MAX_ROUNDS,
				defaultRounds: DEFAULT_ROUNDS,
			};
			const waitingPayload: WaitingForRoundsPayload = {
				gameId: joinedGame.id,
				selectorName,
			};

			io.to(joinedGame.player_one_id).emit("rounds:select", selectPayload);
			io.to(playerId).emit("rounds:waiting", waitingPayload);
		}
	});

	socket.on("rounds:selected", async ({ totalRounds }) => {
		const gameId = socket.data.gameId;
		if (!gameId) {
			return;
		}

		const pendingRoundSelection = pendingRoundSelectionByGame.get(gameId);
		if (!pendingRoundSelection) {
			return;
		}

		if (pendingRoundSelection.selectorPlayerId !== socket.id) {
			return;
		}

		const game = await getGameByPlayerId(socket.id);
		if (!game || !game.player_two_id) {
			return;
		}

		pendingRoundSelectionByGame.delete(gameId);
		await startGameForRoom(io, game, totalRounds);
	});

	/**
	 * Chat message in lobby
	 */
	socket.on("chat:message", ({ message }) => {
		if (!socket.data.name || !message.trim()) return;

		const sanitized = message.trim().slice(0, 200);
		const chatMsg: ChatMessage = {
			playerId: socket.id,
			playerName: socket.data.name,
			message: sanitized,
			timestamp: Date.now(),
		};

		chatHistory.push(chatMsg);
		// Keep only the last 100 messages
		if (chatHistory.length > 100) chatHistory.shift();

		io.to("lobby").emit("chat:message", chatMsg);
	});

	// Handle user disconnecting
	socket.on("disconnect", async () => {
		const gameToDelete = await getGameByPlayerId(socket.id);
		const playerWhoLeft = await getPlayerByPlayerId(socket.id);

		// Delete game from activeGames in-memory object
		if (gameToDelete) {
			delete activeGames[gameToDelete.id];
			rematchRequestsByGame.delete(gameToDelete.id);
			pendingRoundSelectionByGame.delete(gameToDelete.id);
		}

		// Delete game from DB before broadcasting so lobby is accurate
		if (gameToDelete) {
			await deleteGame(socket.id);
			debug("Game deleted", gameToDelete.id);
		}

		// Delete player from DB before broadcasting so they don't appear in onlinePlayers
		if (playerWhoLeft) {
			await deletePlayer(socket.id);
			debug("Disconnected player deleted");
		}

		// Now broadcast updated lobby (player and game already removed from DB)
		await updateLobbyForAll(io);

		// Build lobby payload to send to remaining opponent (reflects deletion above)
		const updatedLobbydata = await buildLobbyUpdateForIo(io);

		if (gameToDelete && playerWhoLeft && gameToDelete.player_two_id) {
			// Tell remaining player that opponent disconnected
			socket.to(gameToDelete.id).emit("player:disconnected", {
				player: playerWhoLeft,
				data: updatedLobbydata,
			});
		}

		debug("👋 A user disconnected with id: %s", socket.id);
	});

	/**
	 * Summon the virus
	 */
	socket.on("player:clicked", async (timestampPayload) => {
		const gameId = socket.data.gameId;
		const currentGame = activeGames[gameId];
		if (!currentGame) {
			return;
		}

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
			const hasMoreRounds = currentGame.round < currentGame.totalRounds;

			// Compare reaction time of both
			if (fastestInRound.playerId === currentGame.player_one_id) {
				currentGame.player_one_score++;
			} else {
				currentGame.player_two_score++;
			}

			if (hasMoreRounds) {
				currentGame.round++;
			}
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
				totalRounds: currentGame.totalRounds,
				fastest_player_id: currentGame.fastest_player_id,
				fastest_Time: currentGame.fastest_Time,
			};

			io.to(gameId).emit("game:data", gameData);

			// Emit data about current state of played and live games to all
			await updateLobbyForAll(io);

			// If round is within configured round limit, send new virus
			if (hasMoreRounds) {
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
				await updateLobbyForAll(io);
			}
		}
	});
};
