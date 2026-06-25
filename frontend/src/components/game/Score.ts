import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const render = () => {
		const div = document.createElement("div");
		const isMe = socketId === playerOne.id ? "text-primary" : "";
		const isPlayerTwo = socketId === playerTwo.id ? "text-primary" : "";

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		div.innerHTML = `
			<span class="${isMe}">${playerOne.score}</span>
			<span>-</span>
			<span class="${isPlayerTwo}">${playerTwo.score}</span>
		`;

		const p1Span = div.children[0] as HTMLSpanElement;
		const p2Span = div.children[2] as HTMLSpanElement;

		return {
			element: div,
			updateScores: (newPlayerOne: PlayerPayload, newPlayerTwo: PlayerPayload) => {
				p1Span.textContent = String(newPlayerOne.score);
				p1Span.className = socketId === newPlayerOne.id ? "text-primary" : "";

				p2Span.textContent = String(newPlayerTwo.score);
				p2Span.className = socketId === newPlayerTwo.id ? "text-primary" : "";
			}
		};
	};
	return render();
}
