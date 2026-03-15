import { buildLobbyUpdateForIo } from "../controllers/socket.controller.ts";
import type { AppServer } from "../types/socket.types.ts";

export const updateLobbyForAll = async (io: AppServer) => {
	const lobbyData = await buildLobbyUpdateForIo(io);

	io.to("lobby").emit("lobby:update", {
		...lobbyData,
	});
};
