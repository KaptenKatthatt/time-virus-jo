import { type Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";

export const createPlayer = async (data: Prisma.PlayerCreateInput) => {
	return await prisma.player.create({
		data: {
			id: data.id,
			name: data.name,
		},
	});
};
