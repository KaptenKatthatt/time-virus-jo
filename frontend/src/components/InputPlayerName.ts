import { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";

export function InputPlayerName(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	const render = () => {
		const container = document.createElement("div");
		container.className = "container d-flex justify-content-center align-items-center vh-100";

		const form = document.createElement("form");
		form.className = "text-center p-4 border rounded";

		const title = document.createElement("h1");
		title.className = "mb-2";
		title.innerText = "Virus-game";

		const input = document.createElement("input");
		input.type = "text";
		input.placeholder = "Enter a username";
		input.autofocus = true;
		input.className = "form-control mb-3 p-2 p-lg-3";

		const button = document.createElement("button");
		button.type = "submit";
		button.className = "btn btn-primary px-3 py-2 px-lg-4 py-lg-2";
		button.innerText = "Join";

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const playerName = input.value.trim();
			if (!playerName) {
				return;
			}
			socket.emit("playerJoinLobbyRequest", playerName);
		});

		form.appendChild(title);
		form.appendChild(input);
		form.appendChild(button);

		container.appendChild(form);

		return container;
	};

	return render();
}
