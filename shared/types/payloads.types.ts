import { PrismaGame, PrismaPlayer } from "./Models.types.ts";

export type GamePayload = PrismaGame;
type PlayerId = Pick<PrismaPlayer, "id">;

type GameScore = Pick<
  PrismaGame,
  "player_one_name" | "player_two_name" | "player_one_score" | "player_two_score"
>;

export interface GameOverPayload extends GameScore {
  winner: PlayerId;
}

export interface ScorePayload {
  id: string;
  score: number;
  playerNbr: number;
  playerName: string;
}

export interface TimestampPayload extends PlayerId {
  timestamp: number;
}

export interface VirusPayload {
  x: number;
  y: number;
  delay: number;
}
