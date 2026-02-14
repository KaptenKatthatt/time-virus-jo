/**
 * Logic related to creating a game room and adding players to it.
 */

import { prisma } from "../lib/prisma.ts";

export const createGame = async (playerOneId: string) => {
	return await prisma.game.create({
		data: {
			player_one_id: playerOneId,
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
