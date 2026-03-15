/**
 * Logic related to creating a game room and adding players to it.
 */

import type { ActiveGame } from "../controllers/socket.controller.ts";
import { prisma } from "../lib/prisma.ts";

export const resetGame = async (gameId: string) => {
	return await prisma.game.update({
		where: { id: gameId },
		data: {
			player_one_score: 0,
			player_two_score: 0,
			round: 1,
			fastest_player_id: "",
			fastest_Time: 0,
		},
	});
};

export const createGame = async (playerOneId: string, playerOneName: string) => {
	return await prisma.game.create({
		data: {
			player_one_id: playerOneId,
			player_one_name: playerOneName,
			player_two_id: null,
		},
	});
};

export const findAvailableGame = async () => {
	return await prisma.game.findFirst({
		where: {
			player_two_id: null,
		},
	});
};

export const joinGame = async (playerId: string, gameId: string, playerName: string) => {
	return await prisma.game.update({
		where: { id: gameId },
		data: {
			player_two_id: playerId,
			player_two_name: playerName,
		},
	});
};

export const deleteGame = async (playerId: string) => {
	await prisma.game.deleteMany({
		where: {
			OR: [{ player_one_id: playerId }, { player_two_id: playerId }],
		},
	});
};

export const deletePlayer = async (playerId: string) => {
	await prisma.player.delete({
		where: { id: playerId },
	});
};

export const getGameByPlayerId = async (playerId: string) => {
	return await prisma.game.findFirst({
		where: {
			OR: [{ player_one_id: playerId }, { player_two_id: playerId }],
		},
	});
};

export const getPlayerByPlayerId = async (playerId: string) => {
	return await prisma.player.findUnique({
		where: { id: playerId },
	});
};

export const getAllPlayers = async () => {
	return await prisma.player.findMany({
		select: { id: true, name: true },
	});
};

export const cleanupTransientGameState = async () => {
	await prisma.game.deleteMany();
	await prisma.player.deleteMany();
};

export const findGameIdsByPlayerIds = async (playerIds: string[]) => {
	if (playerIds.length === 0) {
		return [] as string[];
	}

	const games = await prisma.game.findMany({
		where: {
			OR: [{ player_one_id: { in: playerIds } }, { player_two_id: { in: playerIds } }],
		},
		select: {
			id: true,
		},
	});

	return games.map((game) => game.id);
};

export const deleteGamesByPlayerIds = async (playerIds: string[]) => {
	if (playerIds.length === 0) {
		return;
	}

	await prisma.game.deleteMany({
		where: {
			OR: [{ player_one_id: { in: playerIds } }, { player_two_id: { in: playerIds } }],
		},
	});
};

export const deletePlayersByIds = async (playerIds: string[]) => {
	if (playerIds.length === 0) {
		return;
	}

	await prisma.player.deleteMany({
		where: {
			id: { in: playerIds },
		},
	});
};

/**
 * Checks if the player is faster than current fastest player in game object.
 * If so, update game object.
 */
export const checkIfFastestPlayer = (currentGame: ActiveGame) => {
	const currentPlayerObjects = currentGame.clickedPlayers;

	// Find fastest player in round
	const fastestPlayer = currentPlayerObjects.reduce((lowest, player) => {
		return player.reactionTime < lowest.reactionTime ? player : lowest;
	}, currentPlayerObjects[0]);

	// If player is faster than current fastest time, update game obj
	if (fastestPlayer.reactionTime < currentGame.fastest_Time) {
		currentGame.fastest_Time = fastestPlayer.reactionTime;
		currentGame.fastest_player_id = fastestPlayer.playerId;
	}

	return fastestPlayer;
};
