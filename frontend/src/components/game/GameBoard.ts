import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { Socket } from "socket.io-client";
import { Virus } from "./Virus";

interface PlayerPayload {
	id: string;
	name: string;
	score: number;
}

export default function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	const handleVirusClick = (virus: HTMLImageElement) => {
		virus.remove();
		//Send player timestamp to server
		sendTimeStamp();
	};

	const setupSocketListeners = (element: HTMLDivElement) => {
		socket.on("game:virus", (payload) => {
			const virus = Virus(payload.x + 1, payload.y + 1, () => {
				handleVirusClick(virus);
				console.log("Virus clicked");
				console.log("payload-x", payload.x);
				console.log("payload-y", payload.y);
				console.log("payload delay", payload.delay);
			});

			setTimeout(() => {
				element.appendChild(virus);
			}, payload.delay);
		});
	};

	const sendTimeStamp = () => {
		const timestamp = Date.now();
		if (!socket.id) return;
		const payload = {
			playerId: socket.id,
			timestamp,
		};
		socket.emit("player:clicks", payload);
	};

	//TODO: get gameData player and score

	const data = {
		player_one: {
			id: "id2",
			name: "Jonas",
			score: 0,
		},
		player_two: {
			id: "id1",
			name: "Sandra",
			score: 0,
		},
	};

	const render = () => {
		const gameBoard = document.createElement("div");
		const div = document.createElement("div");

		div.className = "h-100 gameboard-grid ";

		if (!socket.id) {
			return div;
		}

		const score1 = Score(data.player_one, socket.id);
		const score2 = Score(data.player_two, socket.id);

		gameBoard.className = "game-board m-auto scoreboard-border-img";

		setupSocketListeners(gameBoard);

		div.appendChild(score1);
		div.appendChild(gameBoard);
		div.appendChild(score2);

		return div;
	};
	return render();
}

function Score(player: PlayerPayload, socketId: string) {
	const playerId = player.id;
	const name = player.name;
	const score = player.score;

	const render = () => {
		const div = document.createElement("div");
		const isMe = socketId === playerId ? "text-primary" : "";

		div.className = "d-flex justify-content-center align-items-center";

		div.innerHTML = `
			<div class="w-50 scoreboard-border-img d-flex fs-1-xl p-4 flex-column justify-content-center align-items-center gap-2">
				<span class=${isMe}>${name}</span>
				<span>${score}</span>
			</div>
		`;

		return div;
	};
	return render();
}
