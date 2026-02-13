import {
  GameOverPayload,
  GamePayload,
  ScorePayload,
  TimestampPayload,
  VirusPayload,
} from "./payloads.types";

// Events emitted by the server to the client
export interface ServerToClientEvents {
  score: (payload: ScorePayload) => void; // Remove Later
  "game:over": (payload: GameOverPayload) => void;
  "game:data": (payload: GamePayload | GamePayload[]) => void;
  "game:virus": (payload: VirusPayload) => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
  "player:start": (payload: string) => void;
  "player:joins": (payload: string) => void;
  "player:clicks": (payload: TimestampPayload) => void;
  updateScore: (payload: ScorePayload) => void; // Remove Later
  sendTimestamp: (timestampPayload: TimestampPayload) => void; // Remove Later
}
