import type { PrismaScoreboard } from "@shared/types/Models.types";
import type { User } from "../../../backend/generated/prisma/client";

export type ScoreboardOmitId = Omit<PrismaScoreboard, "id">;

export type PlayerPickId = Pick<User, "id">;
