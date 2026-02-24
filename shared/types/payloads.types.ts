import type { PrismaGame, PrismaPlayer } from "./Models.types.ts";

export type GamePayload = PrismaGame;
export type GameId = GamePayload["id"];
export type PlayerId = Pick<PrismaPlayer, "id">;

export interface GameOverPayload {
  playerOne: {
    name: string;
    score: number;
    isWinner: boolean;
  };

  playerTwo: {
    name: string;
    score: number;
    isWinner: boolean;
  };
}

export interface ScoreBoardPayload {
  name: string | null;
  player_one_name: string;
  player_two_name: string;
  player_one_score: number;
  player_two_score: number;
}

export interface PlayerConnectedPayload {
  player: PrismaPlayer;
  data: LobbyUpdatePayload;
}

export interface PlayerDisconnectedPayload {
  player: PrismaPlayer;
  data: LobbyUpdatePayload;
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

export interface LobbyUpdatePayload {
  allPlayedGames: ScoreBoardPayload[];
  allLiveGames: LiveGameData[];
}

export interface LiveGameData {
  gameId: string;
  player_one_name: string;
  player_one_score: number;
  player_two_name: string;
  player_two_score: number;
}
