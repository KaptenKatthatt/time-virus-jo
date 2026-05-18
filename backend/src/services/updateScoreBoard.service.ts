import { ScoreBoardPayload } from "@shared/types/payloads.types.ts";
import { prisma } from "../lib/prisma.ts";

let scoreboardCache: Omit<ScoreBoardPayload, 'id'>[] | null = null;

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

    scoreboardCache = null;

    return result;
}

export const getScoreboard = async () => {
    if (scoreboardCache) {
        return scoreboardCache;
    }

    const results = await prisma.scoreboard.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
        omit: {
            id: true,
        }
    });

    scoreboardCache = results;
    return results;
}