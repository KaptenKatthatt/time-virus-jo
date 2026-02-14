import { prisma } from "../lib/prisma.ts";

export const createGame = (playerOneId: string) => {
	return prisma.game.create({
		data: {
			player_one_id: playerOneId,
		},
	});
};
