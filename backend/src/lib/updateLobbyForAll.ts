import { buildLobbyUpdate } from "../controllers/socket.controller.ts";
import type { AppServer } from "../types/socket.types.ts";

export const updateLobbyForAll = async (io: AppServer) => {
	const lobbyData = await buildLobbyUpdate();

	const lobbySockets = await io.in("lobby").fetchSockets();
	const socketPlayers = lobbySockets
		.map((lobbySocket) => ({
			id: lobbySocket.id,
			name: lobbySocket.data.name as string | undefined,
		}))
		.filter((player) => Boolean(player.name));

	const mergedPlayersById = new Map<string, { id: string; name: string }>();

	for (const player of lobbyData.onlinePlayers) {
		mergedPlayersById.set(player.id, player);
	}

	for (const player of socketPlayers) {
		mergedPlayersById.set(player.id, { id: player.id, name: player.name! });
	}

	io.to("lobby").emit("lobby:update", {
		...lobbyData,
		onlinePlayers: Array.from(mergedPlayersById.values()),
	});
};
