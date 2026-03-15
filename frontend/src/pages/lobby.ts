import Button from "../components/Button";
import Scoreboard from "../components/Scoreboard";
import Livematches from "../components/Livematches";
import Chat from "../components/Chat";
import { WaitingModal } from "../components/LobbyModals";
import type { LobbyUpdatePayload } from "@shared/types/payloads.types";
import type { AppClientSocket } from "../types/socket.types";

export let waitingModal: HTMLElement | null = null;

export default function Lobby(socket: AppClientSocket, payload: LobbyUpdatePayload) {
	const div = document.createElement("div");

	div.className = "container lobby-page";

	const logo = document.createElement("div");
	logo.className = "img lobby-logo";

	const grid = document.createElement("div");
	grid.className = "lobby-grid w-100";

	// Left column: Live matches + Scoreboard stacked
	const gamesColumn = document.createElement("div");
	gamesColumn.className = "lobby-games-column";

	const scoreboardWrapper = document.createElement("div");
	scoreboardWrapper.className = "scoreboard-wrapper w-100 my-3";
	let scoreboardEl = Scoreboard(payload.allPlayedGames);
	scoreboardWrapper.appendChild(scoreboardEl);

	const liveWrapper = document.createElement("div");
	liveWrapper.className = "scoreboard-wrapper w-100 my-3";
	let liveEl = Livematches(payload.allLiveGames);
	liveWrapper.appendChild(liveEl);

	gamesColumn.appendChild(liveWrapper);
	gamesColumn.appendChild(scoreboardWrapper);

	// Right column: Chat
	const chatInstance = Chat(socket, payload.onlinePlayers ?? []);
	const chatWrapper = document.createElement("div");
	chatWrapper.className = "lobby-chat-column";
	chatWrapper.appendChild(chatInstance.element);

	const button = Button("Start game", () => {
		if (socket.id) {
			socket.emit("playerJoinGameRequest", socket.id);
		}
		waitingModal = WaitingModal();
		document.body.appendChild(waitingModal);
	});

	button.classList.add("fs-3", "lobby-start-button");

	const leaveButton = document.createElement("button");
	leaveButton.type = "button";
	leaveButton.className = "btn btn-danger fs-3 lobby-start-button";
	leaveButton.innerText = "Leave game";
	leaveButton.addEventListener("click", () => {
		waitingModal?.remove();
		if (socket.id) {
			socket.emit("player:left", { playerId: socket.id });
		}
		socket.disconnect();
	});

	const centerColumn = document.createElement("div");
	centerColumn.className = "lobby-center-column";
	centerColumn.appendChild(logo);
	centerColumn.appendChild(button);
	centerColumn.appendChild(leaveButton);

	grid.appendChild(gamesColumn);
	grid.appendChild(centerColumn);
	grid.appendChild(chatWrapper);

	div.appendChild(grid);

	// Listen for chat messages
	const onChatMessage = (msg: import("@shared/types/payloads.types").ChatMessage) => {
		chatInstance.addMessage(msg);
	};
	socket.on("chat:message", onChatMessage);

	return {
		element: div,
		updateGameTables: (payload: LobbyUpdatePayload) => {
			liveWrapper.innerHTML = "";
			scoreboardWrapper.innerHTML = "";
			liveEl = Livematches(payload.allLiveGames);
			scoreboardEl = Scoreboard(payload.allPlayedGames);
			liveWrapper.appendChild(liveEl);
			scoreboardWrapper.appendChild(scoreboardEl);
			chatInstance.updatePlayers(payload.onlinePlayers ?? []);
		},
		destroy: () => {
			socket.off("chat:message", onChatMessage);
		},
	};
}
