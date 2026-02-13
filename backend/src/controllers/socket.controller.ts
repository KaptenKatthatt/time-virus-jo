/**
 * Socket Controller
 */
import {
	ClientToServerEvents,
	ServerToClientEvents,
	type ScorePayload,
} from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { updateScoreBoard } from "../services/score.service.ts";
import { createUser } from "../services/player.service.ts";

// Create a new debug instance
const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

// Handle new socket connection
export const handleConnection = (
	socket: Socket<ClientToServerEvents, ServerToClientEvents>,
	_io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
	// Yay someone connected to me
	debug("🙋 A user connected with id: %s", socket.id);

	/**
	 * Login user and save name to DB 
	 */

	socket.on("userJoinRequest", async (name:string) => {
        // 1. Create User, set id to socket.id and roomId to the roomId they want to join
        const user = await createUser({
            id: socket.id,
            name,
			gameId: null,
			scoreboardId: null,
        });

        debug("👶 Created user: %o", user);
		
        // Broadcast to everyone in the room (including ourselves) that a user has joined
        // io.to(roomId).emit("userJoined", username, Date.now());
        // Broadcast a list of online users to the room (except ourselves)
        // socket.to(roomId).emit("userList", usersInRoom);
    });

	// Handle user disconnecting
	socket.on("disconnect", () => {
		debug("👋 A user disconnected with id: %s", socket.id);
	});

	/**
	 * Listen for incoming score updates
	 */
	socket.on("updateScore", async (payload: ScorePayload) => {
		//Update score in db
		await updateScoreBoard(payload);

		// Update score on client
		socket.to(payload.id).emit("score", payload);
	});

	// calculateScore(timestamp1, timestamp2)
	// Jämför

	/**
	 * Receive timestamp from client
	 */

	/**
	 * 
	 */
};
