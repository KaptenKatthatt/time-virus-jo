// Events emitted by the server to the client
export interface ServerToClientEvents {
  score: (payload: ScorePayload) => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
  updateScore: (payload: ScorePayload) => void;
  sendTimestamp: (timestampPayload: TimestampPayload) => void;
  userJoinRequest: (name: string) => void;

}

export interface ScorePayload {
  id: string;
  score: number;
  playerNbr: number;
  userJoinRequest: string;
}

export interface TimestampPayload {
  userId: string;
  timestamp: number;
}

export interface Player{
  id: string;
  name: string;
}
