import type { PlayerPayload } from "../../types/game.types";

export interface ScoreUI {
	element: HTMLDivElement;
	update: (playerOne: PlayerPayload, playerTwo: PlayerPayload) => void;
}

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string): ScoreUI {
	const div = document.createElement("div");
	div.className =
		"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

	const playerOneSpan = document.createElement("span");
	playerOneSpan.className = socketId === playerOne.id ? "text-primary" : "";
	playerOneSpan.textContent = String(playerOne.score);

	const dashSpan = document.createElement("span");
	dashSpan.textContent = "-";

	const playerTwoSpan = document.createElement("span");
	playerTwoSpan.className = socketId === playerTwo.id ? "text-primary" : "";
	playerTwoSpan.textContent = String(playerTwo.score);

	div.appendChild(playerOneSpan);
	div.appendChild(dashSpan);
	div.appendChild(playerTwoSpan);

	return {
		element: div,
		// ⚡ Bolt: Expose targeted update method to prevent innerHTML string-to-DOM parsing overhead and layout thrashing
		update: (updatedPlayerOne: PlayerPayload, updatedPlayerTwo: PlayerPayload) => {
			playerOneSpan.textContent = String(updatedPlayerOne.score);
			playerTwoSpan.textContent = String(updatedPlayerTwo.score);
		},
	};
}
