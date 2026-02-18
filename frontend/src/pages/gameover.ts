// import type { Socket } from "socket.io-client";
import Button from "../components/Button";
import type { ScoreboardOmitId } from "../types/scoreboard.types";
import type { PrismaGame } from "@shared/types/Models.types";
// import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";

// export default function GameOver(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
export default function GameOver() {
	//TODO: use the socket arg to get data from server
	//TODO: get data from server with socket.on "gameover:data"
	//get game data from server
	const data: PrismaGame = {
		id: "te",
		name: "name",
		player_one_name: "Jonas",
		player_two_name: "Emil",
		player_one_score: 9,
		player_two_score: 1,
		player_one_id: "aaaa",
		player_two_id: "aaaaaaa",
		round: 1,
		fastest_player_id: "öongöordm",
		fastest_Time: 123213,
	};

	const render = () => {
		const div = document.createElement("div");
		const h1 = document.createElement("h1");

		h1.innerText = "Game over";

		div.className =
			"container flex-column d-flex gap-4 justify-content-center align-items-center vh-100";

		const scoreboard: ScoreboardOmitId = {
			name: data.name ?? "",
			player_one_name: data.player_one_name ?? "",
			player_two_name: data.player_two_name ?? "",
			player_one_score: data.player_one_score ?? 0,
			player_two_score: data.player_two_score ?? 0,
		};

		const score = Result(scoreboard);
		const button = Button("To lobby", () => {
			console.log("click");
		});

		div.appendChild(h1);
		div.appendChild(score);
		div.appendChild(button);

		return div;
	};
	return render();
}

function Result(data: ScoreboardOmitId) {
	const winner = data.player_one_name;

	const render = () => {
		const div = document.createElement("div");

		div.className = "d-flex gap-4 justify-content-center align-items-center";

		const scoreEl1 = ResultItem(data.player_one_name, data.player_one_score, winner);
		const scoreEl2 = ResultItem(data.player_two_name, data.player_two_score, winner);

		div.appendChild(scoreEl1);
		div.appendChild(scoreEl2);

		return div;
	};
	return render();
}

function ResultItem(name: string, score: number, winner: string) {
	const render = () => {
		const div = document.createElement("div");

		div.className =
			"d-flex fs-1 p-4 flex-column justify-content-center align-items-center gap-2";

		if (winner === name) {
			div.classList.add("text-success");
			div.classList.add("fw-bold");
		}

		div.innerHTML = `
			<span>${name}</span>
			<span>${score}</span>
		`;

		return div;
	};
	return render();
}
