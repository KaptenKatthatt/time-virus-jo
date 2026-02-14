import { type Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";

/**
 * Create user
 *@param data Player information
 * @returns {Player} Player
 */

export const createPlayer = async (data: Prisma.PlayerCreateInput) => {
	return await prisma.player.upsert({
		where: {
			id: data.id as string,
		},
		update: {
			name: data.name,
		},
		create: data,
	});
};
