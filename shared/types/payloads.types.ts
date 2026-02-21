import type { PrismaGame, PrismaPlayer } from "./Models.types.ts";

export type GamePayload = PrismaGame;
export type GameId = GamePayload["id"];
export type PlayerId = Pick<PrismaPlayer, "id">;

type GameScore = Pick<
  PrismaGame,
  "player_one_name" | "player_two_name" | "player_one_score" | "player_two_score"
>;

export interface GameOverPayload extends GameScore {
  winner: string | null;
}

export interface GameCreatedPayload {
  gameId: GameId;
  message: string;
}

export interface GameStartPayload {
  gameId: GameId;
  message: string;
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

export interface ReactionData {
  playerId: string;
  reactionTime: number;
}
