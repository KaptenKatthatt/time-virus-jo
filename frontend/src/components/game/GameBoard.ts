import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { Socket } from "socket.io-client";
import { Virus } from "./Virus";

export default function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	let startTime = 0; //timer for gameboard
	let inactivityTimer: number | null = null;

	const handleVirusClick = (virus: HTMLImageElement) => {
		virus.remove();
		//Stop timeout
		if (inactivityTimer) {
			clearTimeout(inactivityTimer)
			inactivityTimer = null;
			console.log("Cleared inactivity");
		}
		//Send player timestamp to server
		sendTimeStamp();
	};

	const setupSocketListeners = (element: HTMLDivElement) => {
		socket.on("game:virus", (payload) => {
			const virus = Virus(payload.x + 1, payload.y + 1, () => {
				handleVirusClick(virus);
				// console.log("Virus clicked");
				// console.log("payload-x", payload.x);
				// console.log("payload-y", payload.y);
				// console.log("payload delay", payload.delay);
			});

			setTimeout(() => {
				startTime = Date.now();
				element.appendChild(virus);
				console.log("virus spawned inactivity timer started");

				inactivityTimer = window.setTimeout(() => {
					console.log("Player inactive - returning to login");
					window.location.reload();
				}, 30000);
			}, payload.delay);

			// Start timer
		});
	};

	const sendTimeStamp = () => {
		const timestamp = Date.now();
		if (!socket.id) return;
		const payload = {
			playerId: socket.id,
			timestamp,
		};

		// Stop timer

		socket.emit("player:clicks", payload);
	};

	const render = () => {
		const gameBoard = document.createElement("div");

		gameBoard.className = "game-board m-auto border-img-dark";

		setupSocketListeners(gameBoard);

		return gameBoard;
	};
	return render();
}
