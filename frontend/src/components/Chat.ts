import type { AppClientSocket } from "../types/socket.types";
import type { ChatMessage, OnlinePlayer } from "@shared/types/payloads.types";

export default function Chat(socket: AppClientSocket, initialPlayers: OnlinePlayer[]) {
	const wrapper = document.createElement("div");
	wrapper.className = "chat-wrapper w-100 my-3";

	const panel = document.createElement("div");
	panel.className = "chat-panel border-img-dark p-3";

	// --- Online players list ---
	const playersSection = document.createElement("div");
	playersSection.className = "chat-players";

	const playersHeading = document.createElement("h5");
	playersHeading.className = "lobby-section-heading text-primary lacquer-regular";
	playersHeading.innerText = "Online";

	const playersList = document.createElement("ul");
	playersList.className = "list-unstyled mb-0 chat-players-list";

	const renderPlayers = (players: OnlinePlayer[]) => {
		playersList.innerHTML = "";
		const unique = players.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
		unique.forEach((p) => {
			const li = document.createElement("li");
			li.className = "d-flex align-items-center gap-2 py-1 ps-2";
			li.innerHTML = `<span class="online-dot"></span><span class="text-light">${escapeHtml(p.name)}</span>`;
			playersList.appendChild(li);
		});
	};

	renderPlayers(initialPlayers);
	playersSection.appendChild(playersHeading);
	playersSection.appendChild(playersList);

	// --- Chat messages ---
	const chatSection = document.createElement("div");
	chatSection.className = "chat-section";

	const chatHeading = document.createElement("h5");
	chatHeading.className = "lobby-section-heading text-primary lacquer-regular";
	chatHeading.innerText = "Chat";

	const messages = document.createElement("div");
	messages.className = "chat-messages overflow mb-3 flex-grow-1";

	const form = document.createElement("form");
	form.className = "d-flex gap-2 mt-auto";

	const input = document.createElement("input");
	input.type = "text";
	input.placeholder = "Write a message...";
	input.maxLength = 200;
	input.className = "flex-grow-1 p-2 border-img-dark-small input-f text-input";
	input.autocomplete = "off";

	const sendBtn = document.createElement("button");
	sendBtn.type = "submit";
	sendBtn.className = "btn border-img-green-solid btn-hover px-3";
	sendBtn.innerText = "Send";

	form.appendChild(input);
	form.appendChild(sendBtn);

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const msg = input.value.trim();
		if (!msg) return;
		socket.emit("chat:message", { message: msg });
		input.value = "";
	});

	chatSection.appendChild(chatHeading);
	chatSection.appendChild(messages);
	chatSection.appendChild(form);

	panel.appendChild(chatSection);
	panel.appendChild(playersSection);
	wrapper.appendChild(panel);

	const addMessage = (payload: ChatMessage) => {
		const msgEl = document.createElement("div");
		msgEl.className = "chat-message mb-1";
		const time = new Date(payload.timestamp).toLocaleTimeString("sv-SE", {
			hour: "2-digit",
			minute: "2-digit",
		});
		msgEl.innerHTML = `<span class="chat-time text-secondary">${time}</span> <span class="chat-name text-primary">${escapeHtml(payload.playerName)}:</span> <span class="text-light">${escapeHtml(payload.message)}</span>`;
		messages.appendChild(msgEl);
		messages.scrollTop = messages.scrollHeight;
	};

	return {
		element: wrapper,
		addMessage,
		updatePlayers: (players: OnlinePlayer[]) => renderPlayers(players),
	};
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
