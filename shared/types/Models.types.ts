/**
 * Re-export Prisma Models to avoid circular dependencies between backend and frontend
 */
import type { User, Scoreboard, Game } from "../../backend/generated/prisma/client.ts";

export type PrismaUser = User;
export type PrismaScoreboard = Scoreboard;
export type PrismaGame = Game;
