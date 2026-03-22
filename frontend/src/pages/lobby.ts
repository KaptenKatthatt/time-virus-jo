import Button from "../components/Button";
import Scoreboard from "../components/Scoreboard";
import Livematches from "../components/Livematches";
import Chat from "../components/Chat";
import { WaitingModal } from "../components/LobbyModals";
import { createLobbyChase } from "../lib/lobbyChase";
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

	const lobbyChase = createLobbyChase(grid);

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

	const leaveButton = Button("Leave game", () => {
		waitingModal?.remove();
		if (socket.id) {
			socket.emit("player:left", { playerId: socket.id });
		}
		socket.disconnect();
	});

	leaveButton.classList.add("fs-3", "lobby-start-button");
	leaveButton.classList.remove("border-img-green-solid");
	leaveButton.classList.add("border-img-red-solid");

	const centerColumn = document.createElement("div");
	centerColumn.className = "lobby-center-column";
	centerColumn.appendChild(logo);
	centerColumn.appendChild(button);
	centerColumn.appendChild(leaveButton);

	grid.appendChild(gamesColumn);
	grid.appendChild(centerColumn);
	grid.appendChild(chatWrapper);

	const footer = document.createElement("footer");
	footer.className = "lobby-footer";

	const footerTopLine = document.createElement("div");
	footerTopLine.className = "lobby-footer-top-line";
	footer.appendChild(footerTopLine);

	const footerHeading = document.createElement("h3");
	footerHeading.className = "lobby-footer-heading";
	footerHeading.textContent = "Made by these fine developers in 2026";
	footer.appendChild(footerHeading);

	const footerLinks = document.createElement("div");
	footerLinks.className = "lobby-footer-links";

	const developers = [
		{ name: "KaptenKatthatt", url: "https://github.com/KaptenKatthatt" },
		{ name: "let-sandystar", url: "https://github.com/let-sandystar" },
		{ name: "GrimSpook", url: "https://github.com/GrimSpook" },
	];

	developers.forEach((developer, index) => {
		const link = document.createElement("a");
		link.className = "lobby-footer-link";
		link.href = developer.url;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		link.textContent = developer.name;
		footerLinks.appendChild(link);

		if (index < developers.length - 1) {
			const separator = document.createElement("span");
			separator.className = "lobby-footer-separator";
			separator.setAttribute("aria-hidden", "true");
			footerLinks.appendChild(separator);
		}
	});

	footer.appendChild(footerLinks);

	div.appendChild(lobbyChase.element);
	div.appendChild(grid);
	div.appendChild(footer);
	lobbyChase.start();

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
			lobbyChase.destroy();
		},
	};
}
