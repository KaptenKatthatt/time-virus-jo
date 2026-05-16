import { ScoreBoardPayload } from "@shared/types/payloads.types.ts";
import { prisma } from "../lib/prisma.ts";

// ⚡ Bolt: Cache to store the latest 10 scoreboard entries
// Avoids repeated DB queries on every lobby update since backend is a single instance.
let cachedScoreboard: Awaited<ReturnType<typeof _getScoreboardDb>> | null = null;

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

    // ⚡ Bolt: Invalidate cache when a new score is added
    cachedScoreboard = null;
    return result;
}

const _getScoreboardDb = async () => {
    return await prisma.scoreboard.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
        omit: {
            id: true,
        }
    });
}

export const getScoreboard = async () => {
    // ⚡ Bolt: Return cached scoreboard to prevent DB query on every lobby update
    if (cachedScoreboard !== null) {
        return cachedScoreboard;
    }

    cachedScoreboard = await _getScoreboardDb();
    return cachedScoreboard;
}
