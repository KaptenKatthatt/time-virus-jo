import type { PrismaGame } from "@shared/types/Models.types";

export type GameOmitId = Omit<PrismaGame, "id">;
export interface PlayerPayload {
	name: string;
	id: string;
	score: number;
}
