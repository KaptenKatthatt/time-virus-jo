import type { PrismaGame, PrismaPlayer, PrismaScoreboard } from "./Models.types.ts";

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

export interface ScoreBoardPayload {
  name: string | null;
  player_one_name: string;
  player_two_name: string;
  player_one_score: number;
  player_two_score: number;
}

export interface PlayerConfirmedPayload {
  player: PrismaPlayer;
  data: ScoreBoardPayload[];
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
