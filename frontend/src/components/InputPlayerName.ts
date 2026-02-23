import type { AppClientSocket } from "../types/socket.types";

export function InputPlayerName(socket: AppClientSocket) {
	const render = () => {
		const container = document.createElement("div");
		container.className = "d-flex justify-content-center align-items-center h-100 w-100";

		const form = document.createElement("form");
		form.className =
			"text-center border-img-dark d-flex flex-column justify-content-center align-items-center gap-4 py-5";

		const title = document.createElement("div");
		title.className = "img";

		const input = document.createElement("input");
		input.type = "text";
		input.placeholder = "Enter a username";
		input.autofocus = true;
		input.className = "fs-3 p-3 border-img-dark-small input-f text-input";

		const button = document.createElement("button");
		button.type = "submit";
		button.className = "btn fs-3 px-5 border-img-green-solid btn-hover";
		button.innerText = "JOIN";

		const err = document.createElement("span");
		err.innerText = "Enter username";
		err.className = "d-none";

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const playerName = input.value.trim();
			if (!playerName) {
				err.className = "d-flex fs-4 text-danger";
				return;
			}
			socket.emit("playerJoinLobbyRequest", playerName);
		});

		form.appendChild(title);
		form.appendChild(input);
		form.appendChild(err);
		form.appendChild(button);

		container.appendChild(form);

		return container;
	};

	return render();
}
