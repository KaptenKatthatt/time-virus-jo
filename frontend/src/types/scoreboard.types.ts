import type { PrismaPlayer, PrismaScoreboard } from "@shared/types/Models.types";

export type ScoreboardOmitId = Omit<PrismaScoreboard, "id">;

export type PlayerPickId = Pick<PrismaPlayer, "id">;
