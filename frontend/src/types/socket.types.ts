import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { Socket } from "socket.io-client";

export type AppClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
