import { ScoreBoardPayload } from "@shared/types/payloads.types.ts";
import { prisma } from "../lib/prisma.ts";

// Cache for the top 10 scoreboard to prevent unnecessary DB queries
// on every lobby update.
let cachedScoreboard: { name: string | null; player_one_name: string; player_two_name: string; player_one_score: number; player_two_score: number; createdAt: Date; }[] | null = null;

export const createScoreboard = async (payload: ScoreBoardPayload) => {
    const result = await prisma.scoreboard.create({
        data: {
            name: payload.name,
            player_one_name: payload.player_one_name,
            player_two_name: payload.player_two_name,
            player_one_score: payload.player_one_score,
            player_two_score: payload.player_two_score,
        }
    });

    // Invalidate the cache when a new game is completed and added to the scoreboard
    cachedScoreboard = null;

    return result;
}

export const getScoreboard = async () => {
    // Return cached scoreboard if it exists
    if (cachedScoreboard !== null) {
        return cachedScoreboard;
    }

    const result = await prisma.scoreboard.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
        omit: {
            id: true,
        }
    });
    cachedScoreboard = result;

    return result;
}
