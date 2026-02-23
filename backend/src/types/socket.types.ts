import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import type { Server, Socket } from "socket.io";

export type AppSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;
export type AppServer = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

export interface SocketData {
	name: string;
	gameId: string;
}

//Empty filler for position three in socket controller typing. Needs SocketData to be in place 4.
export interface InterServerEvents {}
