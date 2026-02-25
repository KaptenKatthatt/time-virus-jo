import { buildLobbyUpdate } from "../controllers/socket.controller.ts";
import type { AppServer } from "../types/socket.types.ts";

export const updateLobbyForAll = async (io: AppServer) => {
	const lobbyData = await buildLobbyUpdate();
	io.to("lobby").emit("lobby:update", lobbyData);
};
