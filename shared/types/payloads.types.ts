import type { PrismaGame, PrismaPlayer } from "./Models.types.ts";

export type GamePayload = PrismaGame & {
  totalRounds: number;
};
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
  createdAt?: Date;
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

export interface SelectRoundsPayload {
  gameId: GameId;
  selectorName: string;
  minRounds: number;
  maxRounds: number;
  defaultRounds: number;
}

export interface WaitingForRoundsPayload {
  gameId: GameId;
  selectorName: string;
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

export interface OnlinePlayer {
  id: string;
  name: string;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface LobbyUpdatePayload {
  allPlayedGames: ScoreBoardPayload[];
  allLiveGames: LiveGameData[];
  onlinePlayers: OnlinePlayer[];
}

export interface LiveGameData {
  gameId: string;
  player_one_name: string;
  player_one_score: number;
  player_two_name: string;
  player_two_score: number;
}
