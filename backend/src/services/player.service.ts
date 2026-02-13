import { Player } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts"

/**
 * Create user
*@param data Player information
 * @returns {Player} Player
 */

export const createUser = async (data:Player) => {
	return await prisma.player.create({
		data,
	});
}