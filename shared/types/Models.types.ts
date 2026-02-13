/**
 * Re-export Prisma Models to avoid circular dependencies between backend and frontend
 */
import type { Player, Scoreboard, Game } from "../../backend/generated/prisma/client.ts";

export type PrismaPlayer = Player;
export type PrismaScoreboard = Scoreboard;
export type PrismaGame = Game;
