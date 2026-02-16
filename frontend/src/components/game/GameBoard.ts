import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types";
import type { Socket } from "socket.io-client";

export default function GameBoard(socket: Socket<ServerToClientEvents, ClientToServerEvents>) {
	console.log("GameBoard rendering");
	const gameBoard = document.createElement("div");
	let nbrOfRounds = 0;

	const checkNbrOfRounds = () => {
		if (nbrOfRounds < 10) {
			nbrOfRounds++;
		} else {
			// Add game to Scoreboard

			// Goto gameover
			socket.emit("");
		}
	};

	const handleVirusClick = (virus: HTMLButtonElement) => {
		virus.remove();
		//TODO Send player timestamp to server
		sendTimeStamp();

		//Check if 10 turns
		//YES? Go to GameOver. NO? Start new round
		checkNbrOfRounds();
	};

	const setupSocketListeners = () => {
		socket.on("game:virus", (payload) => {
			const virus = document.createElement("button");
			virus.className = `virus x${payload.x + 1} y${payload.y + 1}`;

			virus.addEventListener("click", () => {
				handleVirusClick(virus);
			});

			setTimeout(() => {
				gameBoard.appendChild(virus);
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

	const render = () => {
		gameBoard.className = "game-board m-auto border border-5 border-dark";
		setupSocketListeners();
		return gameBoard;
	};
	return render();
}
