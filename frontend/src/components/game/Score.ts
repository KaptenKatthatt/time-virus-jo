import type { PlayerPayload } from "../../types/game.types";

export interface ScoreComponentReturn {
	element: HTMLDivElement;
	updateScore: (p1Score: number, p2Score: number) => void;
}

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string): ScoreComponentReturn {
	const div = document.createElement("div");
	const isMe = socketId === playerOne.id ? "text-primary" : "";
	const isPlayerTwo = socketId === playerTwo.id ? "text-primary" : "";

	div.className =
		"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

	const p1Span = document.createElement("span");
	if (isMe) p1Span.className = isMe;
	p1Span.textContent = String(playerOne.score);

	const dashSpan = document.createElement("span");
	dashSpan.textContent = "-";

	const p2Span = document.createElement("span");
	if (isPlayerTwo) p2Span.className = isPlayerTwo;
	p2Span.textContent = String(playerTwo.score);

	div.appendChild(p1Span);
	div.appendChild(dashSpan);
	div.appendChild(p2Span);

	return {
		element: div,
		updateScore: (p1Score: number, p2Score: number) => {
			p1Span.textContent = String(p1Score);
			p2Span.textContent = String(p2Score);
		},
	};
}
