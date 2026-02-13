import { GameOverPayload, GamePayload, VirusPayload, type ScorePayload } from "./payloads.types";

// Events emitted by the server to the client
export interface ServerToClientEvents {
  score: (payload: ScorePayload) => void; // Remove Later
  "game:over": (payload: GameOverPayload) => void;
  "game:data": (payload: GamePayload | GamePayload[]) => void;
  "game:virus": (payload: VirusPayload) => void;
  "player:confirmed": (player: Player) => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
  updateScore: (payload: ScorePayload) => void;
  sendTimestamp: (timestampPayload: TimestampPayload) => void;
  playerJoinRequest: (playerName: string) => void;
}

export interface TimestampPayload {
  userId: string;
  timestamp: number;
  "player:start": (payload: string) => void;
  "player:joins": (payload: string) => void;
  "player:clicks": (payload: TimestampPayload) => void;
  updateScore: (payload: ScorePayload) => void; // Remove Later
  sendTimestamp: (timestampPayload: TimestampPayload) => void; // Remove Later
}

export interface Player {
  id: string;
  name: string;
  gameId: string | null;
  scoreboardId: string | null;
}
