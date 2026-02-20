import type { Socket } from "socket.io-client";
import Button from "../components/Button";
// import type { ScoreboardOmitId } from "../types/scoreboard.types";
//import type { PrismaGame } from "@shared/types/Models.types";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { GameOverPayload } from "@shared/types/payloads.types";

export default function GameOver(socket: Socket<ServerToClientEvents, ClientToServerEvents>, payload: GameOverPayload) {

	const onQuit = () => {
		console.log("click");
	}

	const render = () => {
		const div = document.createElement("div");
		div.className = "container flex-column gap-5 h-100 gameover-grid";

		const title = document.createElement("div");
		title.className = "d-flex justify-content-center align-items-center";

		title.innerHTML = `
			<h1 class="border-img-dark p-5 w-50 text-center lacquer-regular text-primary">Game over</h1>
		`;

		const buttonWrapper = document.createElement("div");
		buttonWrapper.className = "d-flex justify-content-center align-items-center";

		const score = Result(payload, socket.id);

		const button = Button("To lobby", onQuit);
		
		button.classList.add("fs-2");

		buttonWrapper.appendChild(button);

		div.appendChild(title);
		div.appendChild(score);
		div.appendChild(buttonWrapper);

		return div;
	};
	return render();
}

function Result(data: GameOverPayload, socketId: string | undefined) {
	const winner = data.winner;

	const render = () => {
		const div = document.createElement("div");
		const span = document.createElement("span");
		span.className = "fs-1 text-muted lacquer-regular";
		span.innerText = "Vs";

		div.className =
			"d-flex p-5 gap-4 justify-content-evenly align-items-center border-img-dark";

		const scoreEl1 = ResultItem(data.player_one_name, data.player_one_score, winner, socketId);
		const scoreEl2 = ResultItem(data.player_two_name, data.player_two_score, winner, socketId);

		div.appendChild(scoreEl1);
		div.appendChild(span);
		div.appendChild(scoreEl2);

		return div;
	};
	return render();
}

function ResultItem(name: string | null, score: number | null, winner: string | null, socketId: string | undefined)  {
	const render = () => {
		const div = document.createElement("div");
		const isMe = winner === socketId ? "text-primary fw-bold" : "";


		div.className =
			"d-flex fs-1 px-5 py-4 flex-column justify-content-center align-items-center gap-2 ";

		div.innerHTML = `
			${isMe ? "<span>👑</span>" : "<span>😭</span>"}
			<span class="${isMe}">${name}</span>
			<span>${score}</span>
		`;

		return div;
	};
	return render();
}
