import type { PrismaPlayer } from "./Models.types";
import type {
  GameOverPayload,
  GamePayload,
  VirusPayload,
  ScorePayload,
  GameCreatedPayload,
  GameStartPayload,
} from "./payloads.types";

// Events emitted by the server to the client
export interface ServerToClientEvents {
  score: (payload: ScorePayload) => void; // Remove Later
  "game:created": (payload: GameCreatedPayload) => void;
  "game:data": (payload: GamePayload | GamePayload[]) => void;
  "game:over": (payload: GameOverPayload) => void;
  "game:start": (payload: GameStartPayload) => void;
  "game:virus": (payload: VirusPayload) => void;
  "player:confirmed": (player: PrismaPlayer) => void;
  "player:disconnected": (playerWhoLeft: PrismaPlayer) => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
  updateScore: (payload: ScorePayload) => void;
  playerJoinLobbyRequest: (playerName: string) => void;
  playerJoinGameRequest: (playerName: string) => void;
  "player:clicked": (payload: TimestampPayload) => void;
  "player:joins": (payload: string) => void;
  "player:start": (payload: string) => void;
}

export interface TimestampPayload {
  playerId: string;
  timestamp: number;
}
