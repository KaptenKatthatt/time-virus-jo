import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
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

	// ⚡ Bolt: Expose an update method that mutates .textContent and .className directly
	// instead of recreating the component and using expensive .innerHTML replacements.
	const updateScore = (p1: PlayerPayload, p2: PlayerPayload) => {
		const isMe = socketId === p1.id ? "text-primary" : "";
		const isPlayerTwo = socketId === p2.id ? "text-primary" : "";

		playerOneSpan.className = isMe;
		playerOneSpan.textContent = String(p1.score);

		playerTwoSpan.className = isPlayerTwo;
		playerTwoSpan.textContent = String(p2.score);
	};

	// Initialize the score
	updateScore(playerOne, playerTwo);

	return {
		element: div,
		updateScore,
	};
}
