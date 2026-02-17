/**
 * Logic related to creating a game room and adding players to it.
 */

import type { ActiveGame } from "../controllers/socket.controller.ts";
import { prisma } from "../lib/prisma.ts";

export const createGame = async (playerOneId: string) => {
	return await prisma.game.create({
		data: {
			player_one_id: playerOneId,
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

export const joinGame = async (playerId: string, gameId: string) => {
	return await prisma.game.update({
		where: { id: gameId },
		data: {
			player_two_id: playerId,
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

/**
 * Checks if the player is faster than current fastest player in game object.
 * If so, update game object.
 */
export const checkIfFastestPlayer = (currentGame: ActiveGame) => {
	const currentPlayerObjects = currentGame.clickedPlayers;

	const fastestPlayer = currentPlayerObjects.reduce((lowest, player) => {
		return player.reactionTime < lowest.reactionTime ? player : lowest;
	}, currentPlayerObjects[0]);

	if (fastestPlayer.reactionTime < currentGame.fastestReactionTime.time) {
		currentGame.fastestReactionTime.time = fastestPlayer.reactionTime;
		currentGame.fastestReactionTime.playerId = fastestPlayer.playerId;
	}
};
