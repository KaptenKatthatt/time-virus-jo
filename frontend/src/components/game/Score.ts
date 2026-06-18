import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const div = document.createElement("div");
	div.className =
		"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

	const playerOneSpan = document.createElement("span");
	playerOneSpan.textContent = String(playerOne.score);
	if (socketId === playerOne.id) playerOneSpan.className = "text-primary";

	const separatorSpan = document.createElement("span");
	separatorSpan.textContent = "-";

	const playerTwoSpan = document.createElement("span");
	playerTwoSpan.textContent = String(playerTwo.score);
	if (socketId === playerTwo.id) playerTwoSpan.className = "text-primary";

	div.appendChild(playerOneSpan);
	div.appendChild(separatorSpan);
	div.appendChild(playerTwoSpan);

	return {
		element: div,
		update: (newPlayerOne: PlayerPayload, newPlayerTwo: PlayerPayload, newSocketId: string) => {
			playerOneSpan.textContent = String(newPlayerOne.score);
			playerOneSpan.className = newSocketId === newPlayerOne.id ? "text-primary" : "";

			playerTwoSpan.textContent = String(newPlayerTwo.score);
			playerTwoSpan.className = newSocketId === newPlayerTwo.id ? "text-primary" : "";
		},
	};
}
