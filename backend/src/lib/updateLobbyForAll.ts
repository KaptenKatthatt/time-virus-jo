import { buildLobbyUpdateForIo } from "../controllers/socket.controller.ts";
import type { AppServer } from "../types/socket.types.ts";

export const updateLobbyForAll = async (io: AppServer) => {
	const lobbyData = await buildLobbyUpdateForIo(io);

	// ⚡ Bolt: Pass lobbyData directly to avoid allocating a new object via spread operator on frequent broadcasts
	io.to("lobby").emit("lobby:update", lobbyData);
};
