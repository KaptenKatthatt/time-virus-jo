import type { PrismaGame } from "@shared/types/Models.types";

export type GameOmitId = Omit<PrismaGame, "id">;
