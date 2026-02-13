import type { ScorePayload } from "@shared/types/payloads.types.ts";
import { prisma } from "../lib/prisma.ts";

export const updateScoreBoard = async (payload: ScorePayload) => {
	const { id, playerNbr, playerName, score } = payload;

	if (playerNbr === 1) {
		return await prisma.game.update({
			where: {
				id,
				player_one_name: playerName,
			},
			data: {
				player_one_score: score,
			},
		});
	} else {
		return await prisma.game.update({
			where: {
				id,
				player_two_name: playerName,
			},
			data: {
				player_two_score: score,
			},
		});
	}
};
