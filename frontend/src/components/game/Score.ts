import type { PlayerPayload } from "../../types/game.types";

export function Score(playerOne: PlayerPayload, playerTwo: PlayerPayload, socketId: string) {
	const render = () => {
		const div = document.createElement("div");
		const isMe = socketId === playerOne.id ? "text-primary" : "";
		const isPlayerTwo = socketId === playerTwo.id ? "text-primary" : "";

		div.className =
			"d-flex justify-content-center align-items-center display-5 bg-dark gap-4 border-img-dark p-4";

		div.innerHTML = `
			<span class="player-one-score ${isMe}">${playerOne.score}</span>
			<span>-</span>
			<span class="player-two-score ${isPlayerTwo}">${playerTwo.score}</span>
		`;

		const playerOneScoreEl = div.querySelector<HTMLSpanElement>(".player-one-score")!;
		const playerTwoScoreEl = div.querySelector<HTMLSpanElement>(".player-two-score")!;

		return {
			element: div,
			updateScore: (p1Score: number, p2Score: number) => {
				playerOneScoreEl.textContent = String(p1Score);
				playerTwoScoreEl.textContent = String(p2Score);
			},
		};
	};
	return render();
}
