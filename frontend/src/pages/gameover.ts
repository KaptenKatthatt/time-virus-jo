import { Socket } from "socket.io-client";
import Button from "../components/Button";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { GameOverPayload } from "@shared/types/payloads.types";
import Lobby from "./lobby";
import { RematchModal } from "../components/LobbyModals";

const app = document.querySelector<HTMLDivElement>("#app")!;

export default function GameOver(
	socket: Socket<ServerToClientEvents, ClientToServerEvents>,
	payload: GameOverPayload,
) {
	const onQuit = (currentDiv: HTMLDivElement) => {
		// TODO: join the lobby

		const lobbyPage = Lobby(socket, []);
		currentDiv.remove();

		app.appendChild(lobbyPage);
	};

	const onRematch = () => {
		socket.emit("player:rematch", { playerId: socket.id! });
	};

	socket.on("player:rematch", (payload) => {
		const rematchModal = RematchModal(payload.name, () => {
			socket.emit("player:rematch", { playerId: socket.id! });
			rematchModal.remove();
		});
		document.body.appendChild(rematchModal);
	});

	const render = () => {
		const div = document.createElement("div");
		div.className = "container flex-column gap-5 h-100 gameover-grid";

		const title = document.createElement("div");
		title.className = "d-flex justify-content-center align-items-center";

		title.innerHTML = `
			<h1 class="border-img-dark p-5 w-50 text-center lacquer-regular text-primary">Game over</h1>
		`;

		const buttonWrapper = document.createElement("div");
		buttonWrapper.className = "d-flex justify-content-center align-items-center gap-5";

		const score = Result(payload);

		const quitButton = Button("To lobby", () => {
			onQuit(div);
		});
		const rematchButton = Button("Rematch ", onRematch);

		quitButton.classList.add("fs-2");
		rematchButton.classList.add("fs-2");

		buttonWrapper.appendChild(quitButton);
		buttonWrapper.appendChild(rematchButton);

		div.appendChild(title);
		div.appendChild(score);
		div.appendChild(buttonWrapper);

		return div;
	};
	return render();
}

function Result(data: GameOverPayload) {
	const render = () => {
		const div = document.createElement("div");
		const span = document.createElement("span");
		span.className = "fs-1 text-muted lacquer-regular";
		span.innerText = "Vs";

		div.className =
			"d-flex p-5 gap-4 justify-content-evenly align-items-center border-img-dark";

		const scoreEl1 = ResultItem(data.playerOne);
		const scoreEl2 = ResultItem(data.playerTwo);

		div.appendChild(scoreEl1);
		div.appendChild(span);
		div.appendChild(scoreEl2);

		return div;
	};
	return render();
}

function ResultItem(data: { name: string; score: number, isWinner: boolean }) {
	const { name, score, isWinner } = data;
	const winnerStyle = isWinner ? "text-primary fw-bold" : "";

	const render = () => {
		const div = document.createElement("div");

		div.className =
			"d-flex fs-1 px-5 py-4 flex-column justify-content-center align-items-center gap-2 ";

		const test = document.createElement("span");
		test.innerHTML = `<span>👑</span>`;

		div.innerHTML = `
			${winnerStyle ? "<span>👑</span>" : "<span>😭</span>"}
			<span class="${winnerStyle}">${name}</span>
			<span>${score}</span>
		`;

		return div;
	};
	return render();
}
