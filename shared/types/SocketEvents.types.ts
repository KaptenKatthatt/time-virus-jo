import type {
  GameOverPayload,
  GamePayload,
  VirusPayload,
  ScorePayload,
  GameCreatedPayload,
  GameStartPayload,
  GameId,
} from "./payloads.types";

// Events emitted by the server to the client
export interface ServerToClientEvents {
  score: (payload: ScorePayload) => void; // Remove Later
  "game:created": (payload: GameCreatedPayload) => void;
  "game:data": (payload: GamePayload | GamePayload[]) => void;
  "game:over": (payload: GameOverPayload) => void;
  "game:start": (payload: GameStartPayload) => void;
  "game:sendVirus": (payload: VirusPayload) => void;
  "player:confirmed": (player: Player) => void;
  "player:disconnected": (playerWhoLeft: Player) => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
  updateScore: (payload: ScorePayload) => void;
  sendTimestamp: (timestampPayload: TimestampPayload) => void;
  playerJoinLobbyRequest: (playerName: string) => void;
  playerJoinGameRequest: (playerName: string) => void;
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
  gameId: GameId | null;
  scoreboardId: string | null;
}
