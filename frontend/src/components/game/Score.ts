import type { PlayerPayload } from "../../types/game.types";

export interface ScoreComponent {
	element: HTMLDivElement;
	update: (playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) => void;
}

export function Score(
	initialPlayerOne: PlayerPayload,
	initialPlayerTwo: PlayerPayload,
	initialSocketId: string,
): ScoreComponent {
	const div = document.createElement("div");
	div.className =
		"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

	const playerOneSpan = document.createElement("span");
	const hyphenSpan = document.createElement("span");
	hyphenSpan.textContent = "-";
	const playerTwoSpan = document.createElement("span");

	div.appendChild(playerOneSpan);
	div.appendChild(hyphenSpan);
	div.appendChild(playerTwoSpan);

	const update = (playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) => {
		// ⚡ Bolt: Update .textContent and .className directly instead of using .innerHTML
		// to prevent layout thrashing and unnecessary DOM parsing during frequent game data updates.
		const isMe = socketId === playerOne.id ? "text-primary" : "";
		const isPlayerTwo = socketId === playerTwo.id ? "text-primary" : "";

		playerOneSpan.className = isMe;
		playerOneSpan.textContent = String(playerOne.score);

		playerTwoSpan.className = isPlayerTwo;
		playerTwoSpan.textContent = String(playerTwo.score);
	};

	update(initialPlayerOne, initialPlayerTwo, initialSocketId);

	return {
		element: div,
		update,
	};
}
